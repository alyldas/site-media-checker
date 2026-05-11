import { describe, expect, it } from "vitest";
import { findAsset, findManifestIcon } from "./preview";
import type { IconAsset } from "@site-media-checker/core";

describe("findManifestIcon", () => {
  it("skips invalid manifest icons", () => {
    const icons: IconAsset[] = [
      manifestIcon({ id: "bad", ok: false, declaredSizes: "512x512" }),
      manifestIcon({ id: "good", ok: true, declaredSizes: "192x192" }),
    ];

    expect(findManifestIcon(icons, ["512x512", "192x192"])?.id).toBe("good");
  });

  it("matches preferred sizes exactly", () => {
    const icons: IconAsset[] = [
      manifestIcon({ id: "wrong", ok: true, declaredSizes: "1512x1512" }),
      manifestIcon({ id: "right", ok: true, declaredSizes: "512x512" }),
    ];

    expect(findManifestIcon(icons, ["512x512"])?.id).toBe("right");
  });
});

describe("findAsset", () => {
  it("keeps raw first-match behavior for diagnostic lists", () => {
    const icons: IconAsset[] = [
      manifestIcon({ id: "bad", ok: false, declaredSizes: "512x512" }),
      manifestIcon({ id: "good", ok: true, declaredSizes: "192x192" }),
    ];

    expect(findAsset(icons, ["manifest-icon"])?.id).toBe("bad");
  });
});

function manifestIcon(
  overrides: Partial<IconAsset> & Pick<IconAsset, "id" | "ok">,
): IconAsset {
  return {
    kind: "manifest-icon",
    source: "manifest",
    declaredUrl: `/${overrides.id}.png`,
    resolvedUrl: `https://example.com/${overrides.id}.png`,
    status: overrides.ok ? 200 : null,
    usedBy: ["android-pwa"],
    warnings: [],
    ...overrides,
  };
}
