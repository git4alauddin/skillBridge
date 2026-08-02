import "reflect-metadata";
import { DataSource } from "typeorm";

import { config } from "./config.js";
import { Application } from "./entities/Application.js";
import { AuditLog } from "./entities/AuditLog.js";
import { Category } from "./entities/Category.js";
import { Opportunity } from "./entities/Opportunity.js";
import { UploadedFile } from "./entities/UploadedFile.js";
import { User } from "./entities/User.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  synchronize: config.database.synchronize,
  logging: config.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  entities: [User, Category, Opportunity, Application, UploadedFile, AuditLog],
});