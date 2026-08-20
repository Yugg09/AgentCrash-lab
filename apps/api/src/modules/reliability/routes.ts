import { Router } from "express";
import { aggregateScores, compareRegressions, overallReliability, type FailureSignature } from "@acl/evaluator-core";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../middleware/error.js";

export const reliabilityRouter = Router();

async function scoresForVersion(versionId: string) {
  const latestCrash = await prisma.testRun.findFirst({
    where: { agentVersionId: versionId, status: "completed", kind: { in: ["crash", "standard", "mutation", "regression"] } },
    orderBy: { completedAt: "desc" },
    include: { executions: { include: { evaluation: true, failure: true } } },
  });
  const latest = latestCrash ?? await prisma.testRun.findFirst({
    where: { agentVersionId: versionId, status: "completed" },
    orderBy: { completedAt: "desc" },
    include: { executions: { include: { evaluation: true, failure: true } } },
  });
  if (!latest) return null;

  const evals = latest.executions.map((e) => e.evaluation).filter(Boolean);
  const aggregated = aggregateScores(
    evals.map((e) => ({
      safety: e!.safetyScore,
      goalCompletion: e!.goalScore,
      toolUsage: e!.toolScore,
      instructionFollowing: e!.instructionScore,
      recovery: e!.recoveryScore,
    })),
  );
  const overall = overallReliability(aggregated);
  const failures = latest.executions.map((e) => e.failure).filter(Boolean);
  const critical = failures.filter((f) => f!.severity === "CRITICAL").length;
  return {
    testRun: latest,
    aggregated,
    overall,
    totals: {
      total: latest.totalScenarios,
      passed: latest.passed,
      failed: latest.failed,
      critical,
    },
    failures: failures as NonNullable<(typeof failures)[number]>[],
  };
}

reliabilityRouter.get(
  "/agents/:id/reliability",
  asyncHandler(async (req, res) => {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { createdAt: "asc" } } },
    });
    if (!agent) throw new HttpError(404, "Agent not found");

    const versionId = typeof req.query.versionId === "string" ? req.query.versionId : agent.versions.at(-1)?.id;
    if (!versionId) throw new HttpError(400, "No agent versions");

    const current = await scoresForVersion(versionId);
    const runs = await prisma.testRun.findMany({
      where: { agentVersionId: versionId, status: "completed" },
      orderBy: { createdAt: "asc" },
    });

    const failureDistribution = await prisma.failure.groupBy({
      by: ["category"],
      where: { execution: { testRun: { agentVersionId: versionId } } },
      _count: { category: true },
    });

    res.json({
      agentId: agent.id,
      versionId,
      reliability: current
        ? {
            overall: current.overall,
            safety: current.aggregated.safety,
            goalCompletion: current.aggregated.goalCompletion,
            toolReliability: current.aggregated.toolUsage,
            instructionFollowing: current.aggregated.instructionFollowing,
            recovery: current.aggregated.recovery,
            ...current.totals,
          }
        : null,
      trend: runs.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        passed: r.passed,
        failed: r.failed,
        total: r.totalScenarios,
        kind: r.kind,
      })),
      failureDistribution: failureDistribution.map((f) => ({ category: f.category, count: f._count.category })),
    });
  }),
);

reliabilityRouter.get(
  "/agents/:id/regressions",
  asyncHandler(async (req, res) => {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { createdAt: "asc" } } },
    });
    if (!agent) throw new HttpError(404, "Agent not found");
    if (agent.versions.length < 2) throw new HttpError(400, "Need at least two versions to compare");

    const fromId = typeof req.query.from === "string" ? req.query.from : agent.versions[0].id;
    const toId = typeof req.query.to === "string" ? req.query.to : agent.versions[agent.versions.length - 1].id;
    const oldV = agent.versions.find((v) => v.id === fromId);
    const newV = agent.versions.find((v) => v.id === toId);
    if (!oldV || !newV) throw new HttpError(400, "Unknown version id");

    const oldS = await scoresForVersion(fromId);
    const newS = await scoresForVersion(toId);

    const toSig = (f: { category: string; affectedTool: string | null; title: string }): FailureSignature => ({
      category: f.category,
      affectedTool: f.affectedTool,
      title: f.title,
    });

    const comparison = compareRegressions({
      oldReliability: oldS?.overall ?? 0,
      newReliability: newS?.overall ?? 0,
      oldCritical: oldS?.totals.critical ?? 0,
      newCritical: newS?.totals.critical ?? 0,
      oldFailures: (oldS?.failures ?? []).map(toSig),
      newFailures: (newS?.failures ?? []).map(toSig),
    });

    res.json({
      from: { id: oldV.id, version: oldV.version },
      to: { id: newV.id, version: newV.version },
      comparison,
      oldRunId: oldS?.testRun.id ?? null,
      newRunId: newS?.testRun.id ?? null,
    });
  }),
);
