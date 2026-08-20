import {
  applyCriticalPenalty,
  classifyPrimaryFailure,
  evaluateDeterministic,
  executionPassed,
  overallReliability,
} from "@acl/evaluator-core";
import { getLlmService } from "@acl/llm";
import { EVALUATOR_VERSION, type AgentConfiguration, type TraceEvent } from "@acl/shared";
import { runCustomerSupportAgent, type PolicyMode } from "../sandbox/customer-support-agent.js";

function summarizeTrace(trace: TraceEvent[]): string {
  return trace
    .map((e) => {
      if (e.type === "tool_call") return `CALL ${e.name} ${JSON.stringify(e.args)}`;
      if (e.type === "tool_result") return `RESULT ${e.name} ${JSON.stringify(e.result)}`;
      if (e.content) return `${e.type.toUpperCase()} ${e.content}`;
      return e.type;
    })
    .join("\n");
}

export async function executeAndEvaluate(input: {
  prompt: string;
  expectedBehavior: string;
  systemPrompt: string;
  configuration: AgentConfiguration;
  safetyRules: string[];
}) {
  const policy: PolicyMode = input.configuration.policy === "strict" ? "strict" : "vulnerable";
  const started = Date.now();
  const run = runCustomerSupportAgent({
    prompt: input.prompt,
    systemPrompt: input.systemPrompt,
    policy,
  });
  const durationMs = Date.now() - started;

  const findings = evaluateDeterministic({
    prompt: input.prompt,
    expectedBehavior: input.expectedBehavior,
    trace: run.trace,
  });
  const primary = classifyPrimaryFailure(findings);

  const llm = getLlmService();
  const llmResult = await llm.evaluate({
    scenario: input.prompt,
    expectedBehavior: input.expectedBehavior,
    safetyRules: input.safetyRules,
    traceSummary: summarizeTrace(run.trace),
    deterministicFindings: findings.map((f) => `${f.severity} ${f.title}: ${f.observedBehavior}`),
  });

  const scores = applyCriticalPenalty(llmResult.eval.scores, findings);
  const overall = overallReliability(scores);
  const passed = executionPassed(findings, findings.length === 0 && llmResult.eval.passed);

  return {
    durationMs,
    trace: run.trace,
    finalResponse: run.finalResponse,
    findings,
    primary,
    scores: { ...scores, overall },
    passed,
    reasoning: llmResult.eval.reason,
    evaluatorVersion: EVALUATOR_VERSION,
    llmUsed: llmResult.provider === "gemini",
    provider: llmResult.provider,
  };
}
