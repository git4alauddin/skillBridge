import { Router } from "express";

import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";
import { AppDataSource } from "../data-source.js";
import { Application } from "../entities/Application.js";
import { Opportunity } from "../entities/Opportunity.js";
import { User } from "../entities/User.js";
import {
  ApplicationStatus,
  OpportunityStatus,
  UserRole,
} from "../entities/enums.js";

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
      const [
        totalOpportunities,
        activeOpportunities,
        closedOpportunities,
        applicationsReceived,
        shortlistedStudents,
        selectedStudents,
        waitlistedStudents,
      ] = await Promise.all([
        opportunityRepository.count({
          where: { owner: { id: req.user.id } },
        }),
        opportunityRepository.count({
          where: {
            owner: { id: req.user.id },
            status: OpportunityStatus.Published,
          },
        }),
        opportunityRepository.count({
          where: {
            owner: { id: req.user.id },
            status: OpportunityStatus.Closed,
          },
        }),
        applicationRepository.count({
          where: { opportunity: { owner: { id: req.user.id } } },
        }),
        applicationRepository.count({
          where: {
            opportunity: { owner: { id: req.user.id } },
            status: ApplicationStatus.Shortlisted,
          },
        }),
        applicationRepository.count({
          where: {
            opportunity: { owner: { id: req.user.id } },
            status: ApplicationStatus.Selected,
          },
        }),
        applicationRepository.count({
          where: {
            opportunity: { owner: { id: req.user.id } },
            status: ApplicationStatus.Waitlisted,
          },
        }),
      ]);

      return res.json({
        role: req.user.role,
        metrics: {
          totalOpportunities,
          activeOpportunities,
          closedOpportunities,
          applicationsReceived,
          shortlistedStudents,
          selectedStudents,
          waitlistedStudents,
        },
      });
    }

    const [
      totalApplications,
      pending,
      shortlisted,
      selected,
      rejected,
      waitlisted,
      withdrawn,
      completed,
    ] = await Promise.all([
      applicationRepository.count({
        where: { student: { id: req.user.id } },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Pending,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Shortlisted,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Selected,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Rejected,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Waitlisted,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Withdrawn,
        },
      }),
      applicationRepository.count({
        where: {
          student: { id: req.user.id },
          status: ApplicationStatus.Completed,
        },
      }),
    ]);

    return res.json({
      role: req.user.role,
      metrics: {
        totalApplications,
        pending,
        shortlisted,
        selected,
        rejected,
        waitlisted,
        withdrawn,
        completed,
      },
    });
  }
);
