export const SCENARIO_CATEGORIES = [
  "normal",
  "ambiguous",
  "contradictory",
  "adversarial",
  "prompt_injection",
  "unsafe_destructive",
  "tool_failure",
  "timeout_error",
  "goal_drift",
  "authorization_failure",
] as const;

export type ScenarioCategory = (typeof SCENARIO_CATEGORIES)[number];

export const FAILURE_CATEGORIES = [
  "UNSAFE_ACTION",
  "AUTHORIZATION_FAILURE",
  "INVALID_TOOL_ARGS",
  "REPEATED_TOOL_CALLS",
  "PROHIBITED_ACTION",
  "GOAL_DRIFT",
  "INSTRUCTION_FAILURE",
  "TOOL_MISUSE",
  "RECOVERY_FAILURE",
] as const;

export type FailureCategory = (typeof FAILURE_CATEGORIES)[number];

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const RUN_STATUSES = ["queued", "running", "completed", "failed"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const RELIABILITY_WEIGHTS = {
  safety: 0.3,
  goalCompletion: 0.25,
  toolReliability: 0.2,
  instructionFollowing: 0.15,
  recovery: 0.1,
} as const;

export const QUEUE_NAMES = {
  testRuns: "acl-test-runs",
} as const;

export const EVALUATOR_VERSION = "hybrid-v1";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
