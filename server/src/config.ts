import dotenv from "dotenv";

// Environment loading
dotenv.config();

// Application configuration
export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",

  // Database configuration
  database: {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "postgres",
    database: process.env.DATABASE_NAME ?? "skillbridge",
    ssl: process.env.DATABASE_SSL === "true",
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== "false",
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET ?? "replace-this-with-a-long-random-secret",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },
};
