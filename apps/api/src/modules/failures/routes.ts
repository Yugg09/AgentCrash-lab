import { Router } from "express";
import { getLlmService } from "@acl/llm";
import { mutateFailureSchema } from "@acl/shared";
import { reproducibility } from "@acl/evaluator-core";
import { prisma } from "../../lib/prisma.js";
import { getTestRunQueue } from "../../lib/queue.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error.js";

export const failuresRouter = Router();

failuresRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const agentId = typeof req.query.agentId === "string" ? req.query.agentId : undefined;
    const failures = await prisma.failure.findMany({
      where: agentId
        ? { execution: { testRun: { agentVersion: { agentId } } } }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        execution: {
          include: {
            scenario: true,
            testRun: { include: { agentVersion: { include: { agent: true } } } },
          },
        },
      },
      take: 100,
    });
    res.json({ failures });
  }),
);

failuresRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const failure = await prisma.failure.findUnique({
      where: { id: req.params.id },
      include: {
        execution: {
          include: {
            scenario: true,
            evaluation: true,
            testRun: { include: { agentVersion: { include: { agent: true, tools: true, safetyRules: true } } } },
          },
        },
      },
    });
    if (!failure) throw new HttpError(404, "Failure not found");
    res.json({ failure });
  }),
);

failuresRouter.get(
  "/:id/executions/:executionId",
  asyncHandler(async (req, res) => {
    const execution = await prisma.execution.findUnique({
      where: { id: req.params.executionId },
      include: { scenario: true, failure: true, evaluation: true },
    });
    if (!execution) throw new HttpError(404, "Execution not found");
    res.json({ execution });
  }),
);

failuresRouter.post(
  "/:id/mutate",
  asyncHandler(async (req, res) => {
    const body = mutateFailureSchema.parse(req.body ?? {});
    const failure = await prisma.failure.findUnique({
      where: { id: req.params.id },
      include: { execution: { include: { scenario: true, testRun: true } } },
    });
    if (!failure) throw new HttpError(404, "Failure not found");

    const llm = getLlmService();
    const mutated = await llm.mutateScenario({
      prompt: failure.execution.scenario.prompt,
      expectedBehavior: failure.expectedBehavior,
      category: failure.execution.scenario.category,
      count: body.count ?? 8,
    });

    const scenarios = await prisma.$transaction(
      mutated.mutations.map((m) =>
        prisma.scenario.create({
          data: {
            agentVersionId: failure.execution.testRun.agentVersionId,
            category: m.category,
            prompt: m.prompt,
            expectedBehavior: m.expectedBehavior,
            source: "mutation",
            parentScenarioId: failure.execution.scenarioId,
          },
        }),
      ),
    );

    const testRun = await prisma.testRun.create({
      data: {
        agentVersionId: failure.execution.testRun.agentVersionId,
        status: "queued",
        kind: "mutation",
        totalScenarios: scenarios.length,
        metadata: { parentFailureId: failure.id, originalScenarioId: failure.execution.scenarioId },
        executions: {
          create: scenarios.map((s) => ({
            scenarioId: s.id,
            status: "queued",
            executionTrace: [],
          })),
        },
      },
    });

    await getTestRunQueue().add("run", { testRunId: testRun.id });
    res.status(202).json({
      testRun,
      scenarios,
      provider: mutated.provider,
      llm: llm.status(),
    });
  }),
);

export const executionsRouter = Router();

executionsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const execution = await prisma.execution.findUnique({
      where: { id: req.params.id },
      include: {
        scenario: true,
        failure: true,
        evaluation: true,
        testRun: { include: { agentVersion: { include: { agent: true } } } },
      },
    });
    if (!execution) throw new HttpError(404, "Execution not found");
    res.json({ execution });
  }),
);

export async function mutationStats(parentScenarioId: string) {
  const children = await prisma.scenario.findMany({
    where: { parentScenarioId },
    include: { executions: { include: { failure: true }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const total = children.length;
  const reproduced = children.filter((c) => c.executions[0]?.failure).length;
  return { total, reproduced, reproducibility: reproducibility(reproduced, total) };
}
