import { assertEquals } from "@std/assert";
import { calculateScore } from "../../../../packages/core/src/score.ts";
import { buildChecks } from "./checks.ts";
import type { ParsedHtmlMetadata } from "./parse-html.ts";

Deno.test("builds checks and score penalties from missing metadata", () => {
  const page: ParsedHtmlMetadata = {
    lang: null,
    title: null,
    description: null,
    themeColor: null,
    themeColors: [],
    canonical: null,
    baseHref: null,
    links: [],
    openGraph: {},
    twitter: {},
  };
  const checks = buildChecks(page, [], null);

  assertEquals(
    checks.some((check) =>
      check.id === "favicon.reachable" && check.severity === "warning"
    ),
    true,
  );
  assertEquals(calculateScore(checks).score < 100, true);
});
