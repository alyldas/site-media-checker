import { assertEquals } from "@std/assert";
import { collectAssetCandidates } from "./resolve-assets.ts";
import type { ParsedHtmlMetadata } from "./parse-html.ts";

Deno.test("resolves social images against base href when present", () => {
  const candidates = collectAssetCandidates(
    {
      lang: null,
      title: null,
      description: null,
      themeColor: null,
      themeColors: [],
      canonical: null,
      baseHref: "https://cdn.example.com/assets/",
      links: [],
      openGraph: {
        "og:image": "social/og.png",
      },
      twitter: {
        "twitter:image": "social/twitter.png",
      },
    } satisfies ParsedHtmlMetadata,
    "https://example.com/page",
  );

  assertEquals(
    candidates.find((candidate) => candidate.kind === "og-image")?.resolvedUrl,
    "https://cdn.example.com/assets/social/og.png",
  );
  assertEquals(
    candidates.find((candidate) => candidate.kind === "twitter-image")
      ?.resolvedUrl,
    "https://cdn.example.com/assets/social/twitter.png",
  );
});
