import { Router } from "express";
import { getLlmService } from "@acl/llm";
import { generateScenariosRequestSchema } from "@acl/shared";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error.js";

export const scenariosRouter = Router();

scenariosRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const agentVersionId = typeof req.query.agentVersionId === "string" ? req.query.agentVersionId : undefined;
    const scenarios = await prisma.scenario.findMany({
      where: agentVersionId ? { agentVersionId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json({ scenarios });
  }),
);

scenariosRouter.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const body = generateScenariosRequestSchema.parse(req.body);
    const version = await prisma.agentVersion.findUnique({
      where: { id: body.agentVersionId },
      include: { agent: true, tools: true, safetyRules: true },
    });
    if (!version) throw new HttpError(404, "Agent version not found");

    const llm = getLlmService();
    const generated = await llm.generateScenarios({
      agentName: version.agent.name,
      goal: version.agent.goal,
      tools: version.tools.map((t) => t.name),
      safetyRules: version.safetyRules.map((r) => r.rule),
      count: body.count ?? 12,
    });

    const created = await prisma.$transaction(
      generated.scenarios
        .filter((s) => !body.categories || body.categories.includes(s.category))
        .map((s) =>
          prisma.scenario.create({
            data: {
              agentVersionId: version.id,
              category: s.category,
              prompt: s.prompt,
              expectedBehavior: s.expectedBehavior,
              source: "generated",
            },
          }),
        ),
    );

    res.status(201).json({
      scenarios: created,
      provider: generated.provider,
      llm: llm.status(),
    });
  }),
);
