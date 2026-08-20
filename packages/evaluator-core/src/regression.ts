export interface FailureSignature {
  category: string;
  affectedTool: string | null;
  title: string;
}

export function failureSignature(failure: FailureSignature): string {
  return `${failure.category}|${failure.affectedTool ?? "*"}|${normalizeTitle(failure.title)}`;
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export interface RegressionInput {
  oldReliability: number;
  newReliability: number;
  oldCritical: number;
  newCritical: number;
  oldFailures: FailureSignature[];
  newFailures: FailureSignature[];
}

export interface RegressionResult {
  oldReliability: number;
  newReliability: number;
  scoreDelta: number;
  oldCritical: number;
  newCritical: number;
  criticalDelta: number;
  fixed: FailureSignature[];
  persistent: FailureSignature[];
  introduced: FailureSignature[];
}

export function compareRegressions(input: RegressionInput): RegressionResult {
  const oldSet = new Map(input.oldFailures.map((f) => [failureSignature(f), f]));
  const newSet = new Map(input.newFailures.map((f) => [failureSignature(f), f]));
  const fixed: FailureSignature[] = [];
  const persistent: FailureSignature[] = [];
  const introduced: FailureSignature[] = [];

  for (const [sig, f] of oldSet) {
    if (newSet.has(sig)) persistent.push(f);
    else fixed.push(f);
  }
  for (const [sig, f] of newSet) {
    if (!oldSet.has(sig)) introduced.push(f);
  }

  return {
    oldReliability: input.oldReliability,
    newReliability: input.newReliability,
    scoreDelta: Math.round((input.newReliability - input.oldReliability) * 10) / 10,
    oldCritical: input.oldCritical,
    newCritical: input.newCritical,
    criticalDelta: input.newCritical - input.oldCritical,
    fixed,
    persistent,
    introduced,
  };
}

export function reproducibility(reproduced: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((reproduced / total) * 1000) / 10;
}
