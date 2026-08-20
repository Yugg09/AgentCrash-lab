import { z } from "zod";
import { FAILURE_CATEGORIES, SCENARIO_CATEGORIES, SEVERITIES } from "./constants.js";

export const scenarioCategorySchema = z.enum(SCENARIO_CATEGORIES);
export const failureCategorySchema = z.enum(FAILURE_CATEGORIES);
export const severitySchema = z.enum(SEVERITIES);

export const generatedScenarioSchema = z.object({
  category: scenarioCategorySchema,
  prompt: z.string().min(8).max(4000),
  expectedBehavior: z.string().min(8).max(4000),
  title: z.string().min(3).max(200).optional(),
});

export const generateScenariosResponseSchema = z.object({
  scenarios: z.array(generatedScenarioSchema).min(1).max(30),
});

export const mutationScenarioSchema = generatedScenarioSchema.extend({
  rationale: z.string().min(4).max(1000).optional(),
});

export const mutateScenariosResponseSchema = z.object({
  mutations: z.array(mutationScenarioSchema).min(1).max(20),
});

export const scoreSetSchema = z.object({
  safety: z.number().min(0).max(100),
  goalCompletion: z.number().min(0).max(100),
  toolUsage: z.number().min(0).max(100),
  instructionFollowing: z.number().min(0).max(100),
  recovery: z.number().min(0).max(100),
});

export const llmEvalResultSchema = z.object({
  passed: z.boolean(),
  category: z.string().min(2).max(80),
  severity: severitySchema,
  reason: z.string().min(4).max(4000),
  scores: scoreSetSchema,
});

export const createAgentSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(4).max(2000),
  goal: z.string().min(4).max(2000),
});

export const createVersionSchema = z.object({
  version: z.string().min(1).max(40),
  systemPrompt: z.string().min(8).max(20000),
  configuration: z
    .object({
      kind: z.string().optional(),
      policy: z.enum(["vulnerable", "strict"]).optional(),
      model: z.string().optional(),
    })
    .optional(),
  copyFromVersionId: z.string().uuid().optional(),
});

export const createToolSchema = z.object({
  versionId: z.string().uuid(),
  name: z.string().min(1).max(80),
  description: z.string().min(4).max(2000),
  inputSchema: z.record(z.unknown()),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
});

export const createRuleSchema = z.object({
  versionId: z.string().uuid(),
  rule: z.string().min(4).max(2000),
  category: z.string().min(2).max(80),
  severity: severitySchema,
});

export const generateScenariosRequestSchema = z.object({
  agentVersionId: z.string().uuid(),
  count: z.number().int().min(4).max(20).optional(),
  categories: z.array(scenarioCategorySchema).optional(),
});

export const createTestRunSchema = z.object({
  agentVersionId: z.string().uuid(),
  scenarioIds: z.array(z.string().uuid()).optional(),
  kind: z.enum(["standard", "mutation", "regression", "developer", "crash"]).optional(),
  filter: z
    .object({
      sources: z.array(z.string()).optional(),
      categories: z.array(scenarioCategorySchema).optional(),
      excludeHappyPath: z.boolean().optional(),
    })
    .optional(),
});

export const mutateFailureSchema = z.object({
  count: z.number().int().min(3).max(12).optional(),
});

export type GeneratedScenario = z.infer<typeof generatedScenarioSchema>;
export type LlmEvalParsed = z.infer<typeof llmEvalResultSchema>;
