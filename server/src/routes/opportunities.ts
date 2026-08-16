import { Router, type Request } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";
import { Opportunity } from "../entities/Opportunity.js";
import {
  OpportunityStatus,
  OpportunityType,
  UserRole,
} from "../entities/enums.js";
import {
  authenticate,
  authorize,
  rolePermissions,
} from "../middleware/auth.js";
import { toPublicOpportunity } from "../utils/sanitize.js";

// Router setup
export const opportunitiesRouter = Router();

// Request validation schemas
const createOpportunitySchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().min(20),
  categoryId: z.string().uuid().optional(),
  type: z.enum([
    OpportunityType.Project,
    OpportunityType.Internship,
    OpportunityType.Research,
    OpportunityType.Hackathon,
    OpportunityType.Collaboration,
  ]),
  capacity: z.coerce.number().int().min(1).max(500),
  deadline: z.coerce.date(),
  startDate: z.coerce.date().optional(),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  attachmentUrl: z.string().trim().url().optional().or(z.literal("")),
});

const updateOpportunitySchema = createOpportunitySchema.partial().extend({
  status: z
    .enum([
      OpportunityStatus.Draft,
      OpportunityStatus.Pending,
      OpportunityStatus.Closed,
    ])
    .optional(),
});

// Opportunity routes
// Create a pending opportunity as a mentor or admin.
opportunitiesRouter.post(
  "/api/opportunities",
  authenticate,
  authorize(...rolePermissions.opportunityManagers),
  async (req, res) => {
    // Validate request body.
    const parsed = createOpportunitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid opportunity data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    // Enforce future deadline rule.
    if (parsed.data.deadline <= new Date()) {
      return res.status(400).json({
        message: "Opportunity deadline must be in the future",
      });
    }

    const opportunityRepository = AppDataSource.getRepository(Opportunity);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Resolve optional active category.
    const category = parsed.data.categoryId
      ? await categoryRepository.findOne({
          where: { id: parsed.data.categoryId, isActive: true },
        })
      : null;

    if (parsed.data.categoryId && !category) {
      return res.status(400).json({
        message: "Category does not exist",
      });
    }

    // Save as pending approval for admin review.
    const opportunity = opportunityRepository.create({
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      capacity: parsed.data.capacity,
      deadline: parsed.data.deadline,
      startDate: parsed.data.startDate ?? null,
      imageUrl: parsed.data.imageUrl || null,
      attachmentUrl: parsed.data.attachmentUrl || null,
      status: OpportunityStatus.Pending,
      owner: req.user,
      category,
    });

    const savedOpportunity = await opportunityRepository.save(opportunity);

    return res.status(201).json({
      opportunity: toPublicOpportunity(savedOpportunity),
    });
  }
);

// List opportunities owned by the authenticated mentor.
opportunitiesRouter.get(
  "/api/opportunities/mine",
  authenticate,
  authorize(...rolePermissions.mentorOnly),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Fetch only records owned by this mentor.
    const opportunities = await opportunityRepository.find({
      where: { owner: { id: req.user.id } },
      relations: { owner: true },
      order: { createdAt: "DESC" },
    });

    return res.json({
      opportunities: opportunities.map(toPublicOpportunity),
    });
  }
);

// Update an opportunity as admin or as the owning mentor.
opportunitiesRouter.patch(
  "/api/opportunities/:id",
  authenticate,
  authorize(...rolePermissions.opportunityManagers),
  async (req: Request<{ id: string }>, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    // Validate update body.
    const parsed = updateOpportunitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid opportunity data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Load opportunity with owner for ownership check.
    const opportunity = await opportunityRepository.findOne({
      where: { id: req.params.id },
      relations: { owner: true },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    // Mentors can edit only their own opportunities.
    if (
      req.user.role === UserRole.Mentor &&
      opportunity.owner.id !== req.user.id
    ) {
      return res.status(403).json({
        message: "Mentors can edit only their own opportunities",
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    // Enforce future deadline rule when deadline is updated.
    if (parsed.data.deadline && parsed.data.deadline <= new Date()) {
      return res.status(400).json({
        message: "Opportunity deadline must be in the future",
      });
    }

    // Resolve optional active category when categoryId is updated.
    const category = parsed.data.categoryId
      ? await categoryRepository.findOne({
          where: { id: parsed.data.categoryId, isActive: true },
        })
      : undefined;

    if (parsed.data.categoryId && !category) {
      return res.status(400).json({
        message: "Category does not exist",
      });
    }

    // Apply allowed updates.
    opportunityRepository.merge(opportunity, {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      capacity: parsed.data.capacity,
      deadline: parsed.data.deadline,
      startDate:
        parsed.data.startDate === undefined
          ? opportunity.startDate
          : parsed.data.startDate,
      imageUrl:
        parsed.data.imageUrl === undefined
          ? opportunity.imageUrl
          : parsed.data.imageUrl || null,
      attachmentUrl:
        parsed.data.attachmentUrl === undefined
          ? opportunity.attachmentUrl
          : parsed.data.attachmentUrl || null,
      status: parsed.data.status,
      category: category === undefined ? opportunity.category : category,
    });

    const savedOpportunity = await opportunityRepository.save(opportunity);

    return res.json({
      opportunity: toPublicOpportunity(savedOpportunity),
    });
  }
);

// List published opportunities for public browsing.
opportunitiesRouter.get("/api/opportunities", async (_req, res) => {
  const opportunityRepository = AppDataSource.getRepository(Opportunity);

  // Fetch first page of published opportunities only.
  const [opportunities, total] = await opportunityRepository.findAndCount({
    where: { status: OpportunityStatus.Published },
    relations: { owner: true },
    order: { createdAt: "DESC" },
    take: 12,
    skip: 0,
  });

  return res.json({
    opportunities: opportunities.map(toPublicOpportunity),
    total,
    page: 1,
    limit: 12,
  });
});
