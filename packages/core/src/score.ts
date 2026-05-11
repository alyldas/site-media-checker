import type { Check } from "./types.ts";

export interface ScoreSummary {
  score: number;
  passed: number;
  warnings: number;
  errors: number;
  info: number;
}

export function calculateScore(
  checks: Check[],
  hasCriticalFailure = false,
): ScoreSummary {
  if (hasCriticalFailure) {
    return {
      score: 0,
      passed: countSeverity(checks, "ok"),
      warnings: countSeverity(checks, "warning"),
      errors: countSeverity(checks, "error"),
      info: countSeverity(checks, "info"),
    };
  }

  const warnings = countSeverity(checks, "warning");
  const errors = countSeverity(checks, "error");
  const score = Math.max(0, Math.min(100, 100 - errors * 12 - warnings * 5));

  return {
    score,
    passed: countSeverity(checks, "ok"),
    warnings,
    errors,
    info: countSeverity(checks, "info"),
  };
}

function countSeverity(checks: Check[], severity: Check["severity"]): number {
  return checks.filter((check) => check.severity === severity).length;
}
