import type { z } from "zod";

export interface JsonGenerationInput<T> {
  system: string;
  user: string;
  schema: z.ZodType<T>;
}

export interface LlmProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateJson<T>(input: JsonGenerationInput<T>): Promise<T>;
}

export class LlmUnavailableError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "LlmUnavailableError";
  }
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.search(/[\[{]/);
  if (start < 0) throw new Error("No JSON object found in model output");
  return JSON.parse(candidate.slice(start));
}
