import { generatedScenarioSchema, mutateScenariosResponseSchema, generateScenariosResponseSchema } from "@acl/shared";

export function validateGeneratedScenarios(payload: unknown) {
  return generateScenariosResponseSchema.parse(payload);
}

export function validateMutations(payload: unknown) {
  return mutateScenariosResponseSchema.parse(payload);
}

export function isValidScenario(payload: unknown) {
  return generatedScenarioSchema.safeParse(payload).success;
}
