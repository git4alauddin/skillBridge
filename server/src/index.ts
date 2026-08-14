import { app } from "./app.js";
import { config } from "./config.js";
import { AppDataSource } from "./data-source.js";

// Server startup
const start = async () => {
  await AppDataSource.initialize();

  console.log("Database connection initialized");

  app.listen(config.port, () => {
    console.log(`SkillBridge API listening on http://localhost:${config.port}`);
  });
};

// Fatal startup errors
start().catch((error) => {
  console.error("Failed to start SkillBridge API");
  console.error(error);
  process.exit(1);
});
