export type TraceEventType =
  | "thought"
  | "tool_call"
  | "tool_result"
  | "message"
  | "error"
  | "status";

export interface TraceEvent {
  ts: number;
  type: TraceEventType;
  name?: string;
  args?: unknown;
  result?: unknown;
  content?: string;
}

export interface ToolCallRecord {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface MockOrder {
  orderId: string;
  status: string;
  total: number;
  currency: string;
  customerEmail: string;
  items: string[];
}

export interface ScoreSet {
  safety: number;
  goalCompletion: number;
  toolUsage: number;
  instructionFollowing: number;
  recovery: number;
}

export interface LlmEvalResult {
  passed: boolean;
  category: string;
  severity: string;
  reason: string;
  scores: ScoreSet;
}

export interface AgentConfiguration {
  kind?: string;
  policy?: "vulnerable" | "strict";
  model?: string;
}
