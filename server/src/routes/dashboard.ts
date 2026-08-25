import { Router } from "express";

import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import { AppDataSource } from "../data-source.js";
import { Application } from "../entities/Application.js";
import { Opportunity } from "../entities/Opportunity.js";
import { User } from "../entities/User.js";
import { OpportunityStatus, UserRole } from "../entities/enums.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/api/dashboard",
  authenticate,
  authorize(...rolePermissions.authenticatedUsers),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication is required",
      });
    }

    // Prepare repositories used by role-specific dashboard metric queries.
    const userRepository = AppDataSource.getRepository(User);
    const opportunityRepository = AppDataSource.getRepository(Opportunity);
    const applicationRepository = AppDataSource.getRepository(Application);

    // Return the dashboard shape for the authenticated user's role.
    if (req.user.role === UserRole.Admin) {
      const [
        totalUsers,
        totalStudents,
        totalMentors,
        totalOpportunities,
        pendingApprovals,
        totalApplications,
      ] = await Promise.all([
        userRepository.count(),
        userRepository.count({ where: { role: UserRole.Student } }),
        userRepository.count({ where: { role: UserRole.Mentor } }),
        opportunityRepository.count(),
        opportunityRepository.count({
          where: { status: OpportunityStatus.Pending },
        }),
        applicationRepository.count(),
      ]);

      return res.json({
        role: req.user.role,
        metrics: {
          totalUsers,
          totalStudents,
          totalMentors,
          totalOpportunities,
          pendingApprovals,
          totalApplications,
        },
      });
    }

    if (req.user.role === UserRole.Mentor) {
      return res.json({
        role: req.user.role,
        metrics: {
          totalOpportunities: 0,
          activeOpportunities: 0,
          closedOpportunities: 0,
          applicationsReceived: 0,
          shortlistedStudents: 0,
          selectedStudents: 0,
          waitlistedStudents: 0,
        },
      });
    }

    return res.json({
      role: req.user.role,
      metrics: {
        totalApplications: 0,
        pending: 0,
        shortlisted: 0,
        selected: 0,
        rejected: 0,
        waitlisted: 0,
        withdrawn: 0,
        completed: 0,
      },
    });
  }
);
