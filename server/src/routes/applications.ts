import { Router, type Request } from "express";
import { z } from "zod";

import { AppDataSource } from "../data-source.js";
import { Application } from "../entities/Application.js";
import { Opportunity } from "../entities/Opportunity.js";
import {
  ApplicationStatus,
  OpportunityStatus,
  UserRole,
} from "../entities/enums.js";
import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import {
  createPaginationMeta,
  createPaginationQuerySchema,
  getPaginationParams,
} from "../utils/pagination.js";
import { toPublicApplication } from "../utils/sanitize.js";

export const applicationsRouter = Router();

// Request validation schemas
const applyToOpportunitySchema = z.object({
  coverNote: z.string().trim().max(2000).optional(),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum([
    ApplicationStatus.Pending,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Selected,
    ApplicationStatus.Rejected,
    ApplicationStatus.Waitlisted,
    ApplicationStatus.Completed,
  ]),
  mentorNote: z.string().trim().max(2000).optional(),
});

const applicationListQuerySchema = createPaginationQuerySchema({
  defaultLimit: 3,
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

// List applications visible to the authenticated user.
applicationsRouter.get(
  "/api/applications",
  authenticate,
  authorize(...rolePermissions.authenticatedUsers),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    const parsed = applicationListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid application filters",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const paginationParams = getPaginationParams(
      parsed.data.page,
      parsed.data.limit
    );

    const applicationRepository = AppDataSource.getRepository(Application);

    // Choose application visibility by role.
    const baseFindOptions = {
      relations: {
        student: true,
        opportunity: {
          owner: true,
        },
      },
      order: { createdAt: "DESC" as const },
      skip: paginationParams.skip,
      take: paginationParams.take,
    };

    const [applications, total] =
      req.user.role === UserRole.Admin
        ? await applicationRepository.findAndCount(baseFindOptions)
        : req.user.role === UserRole.Mentor
          ? await applicationRepository.findAndCount({
              ...baseFindOptions,
              where: {
                opportunity: {
                  owner: { id: req.user.id },
                },
              },
            })
          : await applicationRepository.findAndCount({
              ...baseFindOptions,
              where: {
                student: { id: req.user.id },
              },
            });

    return res.json({
      applications: applications.map(toPublicApplication),
      pagination: createPaginationMeta(total, paginationParams),
    });
  }
);

// Update application status as admin or owning mentor.
applicationsRouter.patch(
  "/api/applications/:id/status",
  authenticate,
  authorize(...rolePermissions.opportunityManagers),
  async (req: Request<{ id: string }>, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    // Validate status update body.
    const parsed = updateApplicationStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid application status data",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const applicationRepository = AppDataSource.getRepository(Application);

    // Load application with opportunity owner for mentor ownership check.
    const application = await applicationRepository.findOne({
      where: { id: req.params.id },
      relations: {
        student: true,
        opportunity: {
          owner: true,
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Mentors can review only applications for their own opportunities.
    if (
      req.user.role === UserRole.Mentor &&
      application.opportunity.owner.id !== req.user.id
    ) {
      return res.status(403).json({
        message: "Mentors can review only applications for their own opportunities",
      });
    }

    // Enforce capacity only when selecting a new application.
    if (
      parsed.data.status === ApplicationStatus.Selected &&
      application.status !== ApplicationStatus.Selected
    ) {
      const selectedCount = await applicationRepository.count({
        where: {
          opportunity: { id: application.opportunity.id },
          status: ApplicationStatus.Selected,
        },
      });

      if (selectedCount >= application.opportunity.capacity) {
        return res.status(400).json({
          message: "Opportunity capacity has already been reached",
        });
      }
    }

    application.status = parsed.data.status;
    application.mentorNote =
      parsed.data.mentorNote === undefined
        ? application.mentorNote
        : parsed.data.mentorNote || null;

    const savedApplication = await applicationRepository.save(application);

    return res.json({
      application: toPublicApplication(savedApplication),
    });
  }
);

// Withdraw an application owned by the authenticated student.
applicationsRouter.post(
  "/api/applications/:id/withdraw",
  authenticate,
  authorize(...rolePermissions.studentOnly),
  async (req: Request<{ id: string }>, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    const applicationRepository = AppDataSource.getRepository(Application);

    // Students can withdraw only their own applications.
    const application = await applicationRepository.findOne({
      where: {
        id: req.params.id,
        student: { id: req.user.id },
      },
      relations: {
        student: true,
        opportunity: {
          owner: true,
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.status = ApplicationStatus.Withdrawn;

    const savedApplication = await applicationRepository.save(application);

    return res.json({
      application: toPublicApplication(savedApplication),
    });
  }
);
