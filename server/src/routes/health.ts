import { Router } from "express";
import { AppDataSource } from "../data-source.js";

// Router setup
export const healthRouter = Router();

// Health route
healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "skillbridge-api",
  });
});

// Readiness route
healthRouter.get("/ready", async (_req, res) => {
  if (!AppDataSource.isInitialized) {
    return res.status(503).json({
      ok: false,
      database: "not_initialized",
    });
  }

  try {
    await AppDataSource.query("SELECT 1");

    return res.json({
      ok: true,
      database: "connected",
    });
  } catch {
    return res.status(503).json({
      ok: false,
      database: "unavailable",
    });
  }
});