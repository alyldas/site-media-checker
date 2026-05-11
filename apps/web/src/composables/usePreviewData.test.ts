import { describe, expect, it } from "vitest";
import { ref } from "vue";
import { usePreviewData } from "./usePreviewData";
import type { IconAsset, InspectReport } from "@site-media-checker/core";

describe("usePreviewData icon selection", () => {
  it("skips invalid direct PWA icons before manifest fallback", () => {
    const report = reportWithIcons({
      icons: [icon({ id: "bad-pwa", kind: "manifest-icon", ok: false })],
      manifestIcons: [
        icon({
          id: "good-pwa",
          kind: "manifest-icon",
          ok: true,
          declaredSizes: "512x512",
        }),
      ],
    });

    const preview = usePreviewData(ref(report), ref(""));

    expect(preview.pwaIconAsset.value?.id).toBe("good-pwa");
  });

  it("skips invalid direct Apple icons before manifest fallback", () => {
    const report = reportWithIcons({
      icons: [icon({ id: "bad-apple", kind: "apple-touch-icon", ok: false })],
      manifestIcons: [
        icon({
          id: "good-apple",
          kind: "manifest-icon",
          ok: true,
          declaredSizes: "180x180",
        }),
      ],
    });

    const preview = usePreviewData(ref(report), ref(""));

    expect(preview.appleIconAsset.value?.id).toBe("good-apple");
  });
});

function reportWithIcons({
  icons,
  manifestIcons,
}: {
  icons: IconAsset[];
  manifestIcons: IconAsset[];
}): InspectReport {
  return {
    version: "1.0.0",
    inputUrl: "https://example.com",
    normalizedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    status: 200,
    fetchedAt: "2026-05-11T00:00:00.000Z",
    durationMs: 1,
    score: 100,
    page: null,
    icons,
    manifest: {
      declaredUrl: "/manifest.json",
      resolvedUrl: "https://example.com/manifest.json",
      status: 200,
      ok: true,
      validJson: true,
      fields: {},
      icons: manifestIcons,
      capabilities: {
        hasName: false,
        hasShortName: false,
        hasStartUrl: false,
        hasDisplay: false,
        has192Icon: false,
        has512Icon: false,
        hasMaskableIcon: false,
      },
    },
    social: {
      openGraph: {},
      twitter: {
        fallbacks: {
          titleFromOg: false,
          descriptionFromOg: false,
          imageFromOg: false,
        },
      },
    },
    checks: [],
    limits: {
      maxAssets: 30,
      assetsDiscovered: 0,
      assetsInspected: 0,
      truncated: false,
      maxHtmlBytes: 1_500_000,
      maxImageBytes: 4_000_000,
      maxManifestBytes: 262_144,
    },
  };
}

function icon(
  overrides: Partial<IconAsset> & Pick<IconAsset, "id" | "kind" | "ok">,
): IconAsset {
  return {
    source: overrides.kind === "manifest-icon" ? "manifest" : "html-link",
    declaredUrl: `/${overrides.id}.png`,
    resolvedUrl: `https://example.com/${overrides.id}.png`,
    status: overrides.ok ? 200 : null,
    actualType: "image/png",
    usedBy: [],
    warnings: [],
    ...overrides,
  };
}
