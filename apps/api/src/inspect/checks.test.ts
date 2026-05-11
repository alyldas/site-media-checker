import { assertEquals } from "@std/assert";
import { calculateScore } from "../../../../packages/core/src/score.ts";
import { buildChecks } from "./checks.ts";
import type { InspectedAsset } from "./inspect-asset.ts";
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
  const checks = buildChecks(page, [], null, 200);

  assertEquals(
    checks.some((check) =>
      check.id === "favicon.reachable" && check.severity === "warning"
    ),
    true,
  );
  assertEquals(calculateScore(checks).score < 100, true);
});

Deno.test("marks non-2xx pages as failed even when metadata exists", () => {
  const page: ParsedHtmlMetadata = {
    lang: null,
    title: "Not found",
    description: "Error page",
    themeColor: null,
    themeColors: [],
    canonical: null,
    baseHref: null,
    links: [],
    openGraph: {},
    twitter: {},
  };
  const checks = buildChecks(page, [], null, 404);

  assertEquals(
    checks.some((check) =>
      check.id === "page.reachable" && check.severity === "error" &&
      check.message === "Page returned HTTP 404."
    ),
    true,
  );
});

Deno.test("warns when the inspected page is not HTTPS", () => {
  const page: ParsedHtmlMetadata = {
    lang: null,
    title: "Example",
    description: "Example description",
    themeColor: null,
    themeColors: [],
    canonical: null,
    baseHref: null,
    links: [],
    openGraph: {},
    twitter: {},
  };
  const checks = buildChecks(page, [], null, 200, false);

  assertEquals(
    checks.some((check) =>
      check.id === "page.https" && check.severity === "warning"
    ),
    true,
  );
});

Deno.test("passes HTTPS check when the inspected page is HTTPS", () => {
  const page: ParsedHtmlMetadata = {
    lang: null,
    title: "Example",
    description: "Example description",
    themeColor: null,
    themeColors: [],
    canonical: null,
    baseHref: null,
    links: [],
    openGraph: {},
    twitter: {},
  };
  const checks = buildChecks(page, [], null, 200, true);

  assertEquals(
    checks.some((check) =>
      check.id === "page.https" && check.severity === "ok"
    ),
    true,
  );
});

Deno.test("does not pass declared social images unless a valid image was fetched", () => {
  const page: ParsedHtmlMetadata = {
    lang: null,
    title: "Example",
    description: "Example description",
    themeColor: null,
    themeColors: [],
    canonical: null,
    baseHref: null,
    links: [],
    openGraph: {
      "og:image": "/og.png",
    },
    twitter: {
      "twitter:card": "summary_large_image",
      "twitter:image": "/twitter.png",
    },
  };
  const assets: InspectedAsset[] = [
    {
      id: "asset-1",
      kind: "og-image",
      source: "open-graph",
      declaredUrl: "/og.png",
      resolvedUrl: "https://example.com/og.png",
      status: 200,
      ok: false,
      actualType: "text/html",
      usedBy: ["social-preview"],
      warnings: ["Image dimensions could not be detected"],
    },
    {
      id: "asset-2",
      kind: "twitter-image",
      source: "twitter",
      declaredUrl: "/twitter.png",
      resolvedUrl: "https://example.com/twitter.png",
      status: null,
      ok: false,
      error: "fetch_failed",
      usedBy: ["twitter-card"],
      warnings: [],
    },
  ];

  const checks = buildChecks(page, assets, null, 200);

  assertEquals(
    checks.some((check) =>
      check.id === "social.og-image.reachable" &&
      check.severity === "warning"
    ),
    true,
  );
  assertEquals(
    checks.some((check) =>
      check.id === "twitter.image.reachable" && check.severity === "warning"
    ),
    true,
  );
  assertEquals(
    checks.some((check) =>
      check.id === "og-image.asset.asset-1" && check.severity === "error"
    ),
    true,
  );
});
