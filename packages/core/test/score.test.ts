import { describe, expect, it } from "vitest";
import { calculateScore, type Check } from "../src";

const check = (severity: Check["severity"]): Check => ({
  id: `test.${severity}`,
  title: severity,
  severity,
  message: severity,
  category: "page"
});

describe("calculateScore", () => {
  it("subtracts penalties for errors and warnings", () => {
    expect(calculateScore([check("ok"), check("warning"), check("error")])).toEqual({
      score: 83,
      passed: 1,
      warnings: 1,
      errors: 1,
      info: 0
    });
  });

  it("clamps critical failures to zero", () => {
    expect(calculateScore([check("warning")], true).score).toBe(0);
  });
});
