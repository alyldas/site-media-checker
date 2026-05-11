import { describe, expect, it } from "vitest";
import { RULE_IDS } from "../src";

describe("RULE_IDS", () => {
  it("exports the static check ids emitted by the API", () => {
    expect(Object.values(RULE_IDS).sort()).toEqual([
      "apple.touch-icon",
      "favicon.reachable",
      "manifest.valid-json",
      "page.description",
      "page.https",
      "page.reachable",
      "page.title",
      "pwa.icon-192",
      "pwa.icon-512",
      "pwa.maskable-icon",
      "social.og-image",
      "social.og-image.reachable",
      "twitter.card",
      "twitter.image.reachable",
    ]);
  });
});
