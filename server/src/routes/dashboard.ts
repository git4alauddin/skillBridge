import { Router } from "express";

import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import { UserRole } from "../entities/enums.js";

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

    // Return the dashboard shape for the authenticated user's role.
    if (req.user.role === UserRole.Admin) {
      return res.json({
        role: req.user.role,
        metrics: {
          totalUsers: 0,
          totalStudents: 0,
          totalMentors: 0,
          totalOpportunities: 0,
          pendingApprovals: 0,
          totalApplications: 0,
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