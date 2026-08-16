import { Router } from "express";

export const opportunitiesRouter = Router();

opportunitiesRouter.get("/api/opportunities", (_req, res) => {
  return res.json({
    opportunities: [],
    total: 0,
    page: 1,
    limit: 12,
  });
});