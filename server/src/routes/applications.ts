import { Router, type Request } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { Application } from "../entities/Application.js";
import { Opportunity } from "../entities/Opportunity.js";
import { ApplicationStatus, OpportunityStatus } from "../entities/enums.js";
import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import { toPublicApplication } from "../utils/sanitize.js";

export const applicationsRouter = Router();

// Request validation schemas
const applyToOpportunitySchema = z.object({
  coverNote: z.string().trim().max(2000).optional(),
});

// Application routes
// Apply to a published opportunity as a student.
applicationsRouter.post(
  "/api/opportunities/:id/apply",
  authenticate,
  authorize(...rolePermissions.studentOnly),
  async (req: Request<{ id: string }>, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    // Validate request body.
    const parsed = applyToOpportunitySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid application data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const opportunityRepository = AppDataSource.getRepository(Opportunity);
    const applicationRepository = AppDataSource.getRepository(Application);

    // Students can apply only to existing published opportunities.
    const opportunity = await opportunityRepository.findOne({
      where: { id: req.params.id },
      relations: { owner: true },
    });

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    if (opportunity.status !== OpportunityStatus.Published) {
      return res.status(400).json({
        message: "Students can apply only to published opportunities",
      });
    }

    // Enforce deadline rule.
    if (opportunity.deadline < new Date()) {
      return res.status(400).json({
        message: "Application deadline has passed",
      });
    }

    // Prevent duplicate applications by the same student.
    const existingApplication = await applicationRepository.findOne({
      where: {
        student: { id: req.user.id },
        opportunity: { id: opportunity.id },
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already applied to this opportunity",
      });
    }

    const application = applicationRepository.create({
      status: ApplicationStatus.Pending,
      coverNote: parsed.data.coverNote || null,
      mentorNote: null,
      student: req.user,
      opportunity,
    });

    const savedApplication = await applicationRepository.save(application);

    return res.status(201).json({
      application: toPublicApplication(savedApplication),
    });
  }
);

applicationsRouter.get("/api/applications", (_req, res) => {
  return res.json({
    applications: [],
  });
});