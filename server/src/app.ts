import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { config } from "./config.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

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

app.use(healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);