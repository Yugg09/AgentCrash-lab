import express from "express";
import cors from "cors";
import { getLlmService } from "@acl/llm";
import { agentsRouter } from "./modules/agents/routes.js";
import { scenariosRouter } from "./modules/scenarios/routes.js";
import { testRunsRouter } from "./modules/test-runs/routes.js";
import { executionsRouter, failuresRouter } from "./modules/failures/routes.js";
import { reliabilityRouter } from "./modules/reliability/routes.js";
import { errorHandler } from "./middleware/error.js";
import { prisma } from "./lib/prisma.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", async (_req, res) => {
    res.json({
      ok: true,
      service: "agentcrashlab-api",
      llm: getLlmService().status(),
    });
  });

  app.use("/api/agents", agentsRouter);
  app.use("/api/scenarios", scenariosRouter);
  app.use("/api/test-runs", testRunsRouter);
  app.use("/api/failures", failuresRouter);
  app.use("/api/executions", executionsRouter);
  app.use("/api", reliabilityRouter);

  app.use(errorHandler);
  return app;
}

export { prisma };
