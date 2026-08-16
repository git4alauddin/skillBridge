import { Router } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { Category } from "../entities/Category.js";
import { Opportunity } from "../entities/Opportunity.js";
import { OpportunityStatus, OpportunityType } from "../entities/enums.js";
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

// Opportunity routes
opportunitiesRouter.post(
  "/api/opportunities",
  authenticate,
  authorize(...rolePermissions.opportunityManagers),
  async (req, res) => {
    const parsed = createOpportunitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid opportunity data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    if (parsed.data.deadline <= new Date()) {
      return res.status(400).json({
        message: "Opportunity deadline must be in the future",
      });
    }

    const opportunityRepository = AppDataSource.getRepository(Opportunity);
    const categoryRepository = AppDataSource.getRepository(Category);

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

opportunitiesRouter.get("/api/opportunities", async (_req, res) => {
  const opportunityRepository = AppDataSource.getRepository(Opportunity);

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
