import { Router, type Request } from "express";
import { Brackets } from "typeorm";
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
import {
  createPaginationMeta,
  createPaginationQuerySchema,
  getPaginationParams,
} from "../utils/pagination.js";
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

const publicOpportunityListQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z
    .enum([
      OpportunityType.Project,
      OpportunityType.Internship,
      OpportunityType.Research,
      OpportunityType.Hackathon,
      OpportunityType.Collaboration,
    ])
    .optional(),
  ...createPaginationQuerySchema({ defaultLimit: 12 }).shape,
});

const adminOpportunityReviewQuerySchema = z.object({
  status: z
    .enum([
      "all",
      OpportunityStatus.Draft,
      OpportunityStatus.Pending,
      OpportunityStatus.Published,
      OpportunityStatus.Closed,
      OpportunityStatus.Rejected,
    ])
    .default(OpportunityStatus.Pending),
  ...createPaginationQuerySchema({ defaultLimit: 50 }).shape,
});

const mentorOpportunityListQuerySchema = createPaginationQuerySchema({
  defaultLimit: 12,
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

    const parsed = mentorOpportunityListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid opportunity filters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const paginationParams = getPaginationParams(
      parsed.data.page,
      parsed.data.limit
    );

    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Fetch only records owned by this mentor.
    const [opportunities, total] = await opportunityRepository.findAndCount({
      where: { owner: { id: req.user.id } },
      relations: { owner: true },
      order: { createdAt: "DESC" },
      skip: paginationParams.skip,
      take: paginationParams.take,
    });

    return res.json({
      opportunities: opportunities.map(toPublicOpportunity),
      pagination: createPaginationMeta(total, paginationParams),
    });
  }
);

// List opportunities for admin review and approval workflows.
opportunitiesRouter.get(
  "/api/opportunities/admin/review",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  async (req, res) => {
    const parsed = adminOpportunityReviewQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid opportunity review filters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { status } = parsed.data;
    const paginationParams = getPaginationParams(
      parsed.data.page,
      parsed.data.limit
    );
    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    const query = opportunityRepository
      .createQueryBuilder("opportunity")
      .leftJoinAndSelect("opportunity.owner", "owner")
      .leftJoinAndSelect("opportunity.category", "category")
      .orderBy("opportunity.createdAt", "DESC")
      .take(paginationParams.take)
      .skip(paginationParams.skip);

    if (status !== "all") {
      query.where("opportunity.status = :status", { status });
    }

    const [opportunities, total] = await query.getManyAndCount();

    return res.json({
      opportunities: opportunities.map(toPublicOpportunity),
      pagination: createPaginationMeta(total, paginationParams),
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

// Approve an opportunity and publish it for public browsing.
opportunitiesRouter.post(
  "/api/opportunities/:id/approve",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  async (req: Request<{ id: string }>, res) => {
    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Load opportunity with owner for the public response shape.
    const opportunity = await opportunityRepository.findOne({
      where: { id: req.params.id },
      relations: { owner: true },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    opportunity.status = OpportunityStatus.Published;

    const savedOpportunity = await opportunityRepository.save(opportunity);

    return res.json({
      opportunity: toPublicOpportunity(savedOpportunity),
    });
  }
);

// Reject an opportunity so it stays hidden from public browsing.
opportunitiesRouter.post(
  "/api/opportunities/:id/reject",
  authenticate,
  authorize(...rolePermissions.adminOnly),
  async (req: Request<{ id: string }>, res) => {
    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Load opportunity with owner for the public response shape.
    const opportunity = await opportunityRepository.findOne({
      where: { id: req.params.id },
      relations: { owner: true },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    opportunity.status = OpportunityStatus.Rejected;

    const savedOpportunity = await opportunityRepository.save(opportunity);

    return res.json({
      opportunity: toPublicOpportunity(savedOpportunity),
    });
  }
);

// List published opportunities for public browsing.
opportunitiesRouter.get("/api/opportunities", async (req, res) => {
  const parsed = publicOpportunityListQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid opportunity filters",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { q, type } = parsed.data;
  const paginationParams = getPaginationParams(
    parsed.data.page,
    parsed.data.limit
  );
  const opportunityRepository = AppDataSource.getRepository(Opportunity);

  // Build a public query that always keeps unpublished records hidden.
  const query = opportunityRepository
    .createQueryBuilder("opportunity")
    .leftJoinAndSelect("opportunity.owner", "owner")
    .leftJoinAndSelect("opportunity.category", "category")
    .where("opportunity.status = :status", {
      status: OpportunityStatus.Published,
    });

  if (type) {
    query.andWhere("opportunity.type = :type", { type });
  }

  if (q) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where("opportunity.title ILIKE :search", { search: `%${q}%` })
          .orWhere("opportunity.description ILIKE :search", {
            search: `%${q}%`,
          })
          .orWhere("category.name ILIKE :search", { search: `%${q}%` });
      })
    );
  }

  const [opportunities, total] = await query
    .orderBy("opportunity.createdAt", "DESC")
    .take(paginationParams.take)
    .skip(paginationParams.skip)
    .getManyAndCount();

  return res.json({
    opportunities: opportunities.map(toPublicOpportunity),
    pagination: createPaginationMeta(total, paginationParams),
  });
});

// Return one published opportunity for public browsing.
opportunitiesRouter.get(
  "/api/opportunities/:id",
  async (req: Request<{ id: string }>, res) => {
    const opportunityRepository = AppDataSource.getRepository(Opportunity);

    // Public detail pages should show only published opportunities.
    const opportunity = await opportunityRepository.findOne({
      where: {
        id: req.params.id,
        status: OpportunityStatus.Published,
      },
      relations: { owner: true },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    return res.json({
      opportunity: toPublicOpportunity(opportunity),
    });
  }
);
