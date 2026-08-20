import { Router } from "express";
import { createTestRunSchema } from "@acl/shared";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { getTestRunQueue } from "../../lib/queue.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error.js";

export const testRunsRouter = Router();

testRunsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = createTestRunSchema.parse(req.body);
    const version = await prisma.agentVersion.findUnique({ where: { id: body.agentVersionId } });
    if (!version) throw new HttpError(404, "Agent version not found");

    const where: Prisma.ScenarioWhereInput = { agentVersionId: version.id };
    if (body.scenarioIds?.length) where.id = { in: body.scenarioIds };
    if (body.filter?.sources?.length) where.source = { in: body.filter.sources };
    if (body.filter?.categories?.length) where.category = { in: body.filter.categories };
    if (body.filter?.excludeHappyPath) where.source = { not: "seed_happy" };

    const scenarios = await prisma.scenario.findMany({ where });
    if (scenarios.length === 0) throw new HttpError(400, "No scenarios match this test run");

    const testRun = await prisma.testRun.create({
      data: {
        agentVersionId: version.id,
        status: "queued",
        kind: body.kind ?? "standard",
        totalScenarios: scenarios.length,
        executions: {
          create: scenarios.map((s) => ({
            scenarioId: s.id,
            status: "queued",
            executionTrace: [],
          })),
        },
      },
    });

    await getTestRunQueue().add("run", { testRunId: testRun.id }, { removeOnComplete: 50, removeOnFail: 50 });
    res.status(202).json({ testRun });
  }),
);

testRunsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const agentVersionId = typeof req.query.agentVersionId === "string" ? req.query.agentVersionId : undefined;
    const agentId = typeof req.query.agentId === "string" ? req.query.agentId : undefined;
    const runs = await prisma.testRun.findMany({
      where: {
        ...(agentVersionId ? { agentVersionId } : {}),
        ...(agentId ? { agentVersion: { agentId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { agentVersion: { select: { version: true, agentId: true } } },
      take: 50,
    });
    res.json({ testRuns: runs });
  }),
);

testRunsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const testRun = await prisma.testRun.findUnique({
      where: { id: req.params.id },
      include: {
        agentVersion: { include: { agent: true } },
        executions: {
          include: {
            scenario: true,
            failure: true,
            evaluation: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!testRun) throw new HttpError(404, "Test run not found");
    res.json({ testRun });
  }),
);

testRunsRouter.get(
  "/:id/executions",
  asyncHandler(async (req, res) => {
    const executions = await prisma.execution.findMany({
      where: { testRunId: req.params.id },
      include: { scenario: true, failure: true, evaluation: true },
      orderBy: { createdAt: "asc" },
    });
    res.json({ executions });
  }),
);
