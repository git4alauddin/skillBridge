import { Router } from "express";

export const applicationsRouter = Router();

// Application routes
applicationsRouter.get("/api/applications", (_req, res) => {
  return res.json({
    applications: [],
  });
});