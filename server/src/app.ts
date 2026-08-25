import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { config } from "./config.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";

import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { applicationsRouter } from "./routes/applications.js";

// Express app setup
export const app = express();

// Global middleware
app.use(helmet());

app.use(
  cors({
    origin: config.clientOrigin,
  })
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

// Route registration
app.use(authRouter);
app.use(healthRouter);
app.use(opportunitiesRouter);
app.use(applicationsRouter);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);
