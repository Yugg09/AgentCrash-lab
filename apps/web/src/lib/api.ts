const API = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean; llm: { activeProvider: string; geminiConfigured: boolean; usedFallback: boolean } }>("/api/health"),
  agents: () => request<{ agents: AgentSummary[] }>("/api/agents"),
  agent: (id: string) => request<{ agent: AgentDetail }>(`/api/agents/${id}`),
  reliability: (id: string, versionId?: string) =>
    request<ReliabilityResponse>(`/api/agents/${id}/reliability${versionId ? `?versionId=${versionId}` : ""}`),
  regressions: (id: string, from?: string, to?: string) => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const suffix = q.toString() ? `?${q}` : "";
    return request<RegressionResponse>(`/api/agents/${id}/regressions${suffix}`);
  },
  scenarios: (agentVersionId: string) =>
    request<{ scenarios: Scenario[] }>(`/api/scenarios?agentVersionId=${agentVersionId}`),
  generate: (agentVersionId: string, count = 12) =>
    request<{ scenarios: Scenario[]; provider: string }>("/api/scenarios/generate", {
      method: "POST",
      body: JSON.stringify({ agentVersionId, count }),
    }),
  startRun: (payload: {
    agentVersionId: string;
    kind?: string;
    filter?: { sources?: string[]; excludeHappyPath?: boolean };
    scenarioIds?: string[];
  }) => request<{ testRun: TestRun }>("/api/test-runs", { method: "POST", body: JSON.stringify(payload) }),
  testRun: (id: string) => request<{ testRun: TestRunDetail }>(`/api/test-runs/${id}`),
  testRuns: (agentId?: string) =>
    request<{ testRuns: TestRun[] }>(agentId ? `/api/test-runs?agentId=${agentId}` : "/api/test-runs"),
  failures: (agentId?: string) =>
    request<{ failures: FailureRow[] }>(agentId ? `/api/failures?agentId=${agentId}` : "/api/failures"),
  failure: (id: string) => request<{ failure: FailureDetail }>(`/api/failures/${id}`),
  mutate: (id: string) =>
    request<{ testRun: TestRun; provider: string }>(`/api/failures/${id}/mutate`, {
      method: "POST",
      body: JSON.stringify({ count: 8 }),
    }),
  execution: (id: string) => request<{ execution: ExecutionDetail }>(`/api/executions/${id}`),
};

export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  goal: string;
  versions: { id: string; version: string }[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  riskLevel: string;
  inputSchema: unknown;
}

export interface SafetyRule {
  id: string;
  rule: string;
  category: string;
  severity: string;
}

export interface AgentDetail extends AgentSummary {
  versions: {
    id: string;
    version: string;
    systemPrompt: string;
    configuration: { policy?: string; kind?: string };
    tools: Tool[];
    safetyRules: SafetyRule[];
    _count: { scenarios: number; testRuns: number };
  }[];
}

export interface Scenario {
  id: string;
  category: string;
  prompt: string;
  expectedBehavior: string;
  source: string;
  parentScenarioId?: string | null;
}

export interface TestRun {
  id: string;
  status: string;
  kind: string;
  totalScenarios: number;
  passed: number;
  failed: number;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  agentVersion?: { version: string; agentId?: string };
}

export interface TestRunDetail extends Omit<TestRun, "agentVersion"> {
  agentVersion: { id: string; version: string; agent: { id: string; name: string } };
  executions: ExecutionRow[];
}

export interface ExecutionRow {
  id: string;
  status: string;
  finalResponse: string | null;
  durationMs: number | null;
  executionTrace: TraceEvent[];
  scenario: Scenario;
  failure: { id: string; title: string; severity: string; category: string } | null;
  evaluation: {
    overallScore: number;
    safetyScore: number;
    passed: boolean;
  } | null;
}

export interface TraceEvent {
  ts: number;
  type: string;
  name?: string;
  args?: unknown;
  result?: unknown;
  content?: string;
}

export interface FailureRow {
  id: string;
  title: string;
  category: string;
  severity: string;
  affectedTool: string | null;
  createdAt: string;
  execution: {
    id: string;
    scenario: Scenario;
    testRun: { id: string; agentVersion: { version: string; agent: { id: string; name: string } } };
  };
}

export interface FailureDetail {
  id: string;
  title: string;
  category: string;
  severity: string;
  trigger: string;
  expectedBehavior: string;
  observedBehavior: string;
  affectedTool: string | null;
  reproducibility: number | null;
  evidence: unknown;
  remediation: string;
  execution: ExecutionDetail;
}

export interface ExecutionDetail {
  id: string;
  status: string;
  finalResponse: string | null;
  durationMs: number | null;
  executionTrace: TraceEvent[];
  scenario: Scenario;
  failure: { id: string; title: string; severity: string } | null;
  evaluation: {
    safetyScore: number;
    goalScore: number;
    toolScore: number;
    recoveryScore: number;
    instructionScore: number;
    overallScore: number;
    passed: boolean;
    reasoning: string;
    llmUsed: boolean;
  } | null;
  testRun?: { id: string; agentVersion: { version: string; agent: { id: string; name: string } } };
}

export interface ReliabilityResponse {
  agentId: string;
  versionId: string;
  reliability: {
    overall: number;
    safety: number;
    goalCompletion: number;
    toolReliability: number;
    instructionFollowing: number;
    recovery: number;
    total: number;
    passed: number;
    failed: number;
    critical: number;
  } | null;
  trend: { id: string; createdAt: string; passed: number; failed: number; total: number; kind: string }[];
  failureDistribution: { category: string; count: number }[];
}

export interface RegressionResponse {
  from: { id: string; version: string };
  to: { id: string; version: string };
  comparison: {
    oldReliability: number;
    newReliability: number;
    scoreDelta: number;
    oldCritical: number;
    newCritical: number;
    criticalDelta: number;
    fixed: { title: string; category: string; affectedTool: string | null }[];
    persistent: { title: string; category: string; affectedTool: string | null }[];
    introduced: { title: string; category: string; affectedTool: string | null }[];
  };
}
