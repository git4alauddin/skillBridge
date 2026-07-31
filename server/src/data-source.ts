import "reflect-metadata";
import { DataSource } from "typeorm";

import { config } from "./config.js";

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
  entities: [],
});