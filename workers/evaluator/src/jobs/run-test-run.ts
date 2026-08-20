import { QUEUE_NAMES, type AgentConfiguration } from "@acl/shared";
import { reproducibility } from "@acl/evaluator-core";
import { prisma } from "../prisma.js";
import { executeAndEvaluate } from "../evaluator/hybrid.js";

export interface TestRunJob {
  testRunId: string;
}

export const TEST_RUN_QUEUE = QUEUE_NAMES.testRuns;

export async function processTestRun(job: TestRunJob) {
  const run = await prisma.testRun.findUnique({
    where: { id: job.testRunId },
    include: {
      agentVersion: { include: { safetyRules: true } },
      executions: { include: { scenario: true } },
    },
  });
  if (!run) throw new Error(`Test run ${job.testRunId} not found`);

  await prisma.testRun.update({
    where: { id: run.id },
    data: { status: "running", startedAt: new Date() },
  });

  let passed = 0;
  let failed = 0;

  try {
    for (const execution of run.executions) {
      await prisma.execution.update({
        where: { id: execution.id },
        data: { status: "running" },
      });

      const result = await executeAndEvaluate({
        prompt: execution.scenario.prompt,
        expectedBehavior: execution.scenario.expectedBehavior,
        systemPrompt: run.agentVersion.systemPrompt,
        configuration: (run.agentVersion.configuration ?? {}) as AgentConfiguration,
        safetyRules: run.agentVersion.safetyRules.map((r) => r.rule),
      });

      await prisma.execution.update({
        where: { id: execution.id },
        data: {
          status: "completed",
          finalResponse: result.finalResponse,
          executionTrace: result.trace as object[],
          durationMs: result.durationMs,
        },
      });

      await prisma.evaluation.create({
        data: {
          executionId: execution.id,
          safetyScore: result.scores.safety,
          goalScore: result.scores.goalCompletion,
          toolScore: result.scores.toolUsage,
          recoveryScore: result.scores.recovery,
          instructionScore: result.scores.instructionFollowing,
          overallScore: result.scores.overall,
          passed: result.passed,
          evaluatorVersion: result.evaluatorVersion,
          reasoning: result.reasoning,
          llmUsed: result.llmUsed,
        },
      });

      if (result.primary) {
        await prisma.failure.create({
          data: {
            executionId: execution.id,
            category: result.primary.category,
            severity: result.primary.severity,
            title: result.primary.title,
            trigger: result.primary.trigger,
            expectedBehavior: result.primary.expectedBehavior,
            observedBehavior: result.primary.observedBehavior,
            affectedTool: result.primary.affectedTool,
            evidence: result.primary.evidence as object,
            remediation: result.primary.remediation,
          },
        });
      }

      if (result.passed) passed += 1;
      else failed += 1;

      await prisma.testRun.update({
        where: { id: run.id },
        data: { passed, failed },
      });
    }

    await prisma.testRun.update({
      where: { id: run.id },
      data: { status: "completed", completedAt: new Date(), passed, failed },
    });

    if (run.kind === "mutation") {
      const meta = run.metadata as { parentFailureId?: string; originalScenarioId?: string };
      if (meta.parentFailureId) {
        const parent = await prisma.failure.findUnique({ where: { id: meta.parentFailureId } });
        const childExecs = await prisma.execution.findMany({
          where: { testRunId: run.id },
          include: { failure: true, scenario: true },
        });
        const reproduced = childExecs.filter((e) => e.failure?.category === parent?.category).length;
        await prisma.failure.update({
          where: { id: meta.parentFailureId },
          data: { reproducibility: reproducibility(reproduced, childExecs.length) },
        });
      }
    }
  } catch (error) {
    await prisma.testRun.update({
      where: { id: run.id },
      data: { status: "failed", completedAt: new Date() },
    });
    throw error;
  }
}
