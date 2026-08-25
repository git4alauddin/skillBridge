import { Router } from "express";

import { authenticate, authorize, rolePermissions } from "../middleware/auth.js";

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

    return res.json({
      role: req.user.role,
      metrics: {},
    });
  }
);