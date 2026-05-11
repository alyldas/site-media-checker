import type { ApiConfig } from "../utils/config.ts";
import type {
  IconAsset,
  IconUsage,
} from "../../../../packages/core/src/types.ts";
import { safeFetch } from "./fetch-page.ts";
import { inspectImage } from "./inspect-image.ts";
import type { AssetCandidate } from "./resolve-assets.ts";

type InspectableAssetKind = Exclude<AssetCandidate["kind"], "manifest">;

export interface InspectedAsset extends IconAsset {
  kind: InspectableAssetKind | "manifest-icon";
  source: AssetCandidate["source"] | "manifest";
}

export async function inspectAsset(
  candidate: AssetCandidate & { kind: InspectableAssetKind },
  config: ApiConfig,
  id: string,
): Promise<InspectedAsset> {
  try {
    const result = await safeFetch(candidate.resolvedUrl, config, {
      timeoutMs: config.fetchTimeoutMs,
      maxBytes: config.maxAssetBytes,
      maxRedirects: config.maxRedirects,
      userAgent: config.userAgent,
      allowedContentTypes: [
        "image/avif",
        "image/webp",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/svg+xml",
        "image/x-icon",
        "image/vnd.microsoft.icon",
        "*/*",
      ],
    });
    const image = inspectImage(result.body, result.contentType);
    const warnings = image.warning ? [image.warning] : [];

    return {
      id,
      kind: candidate.kind,
      source: candidate.source,
      rel: candidate.rel,
      declaredUrl: candidate.declaredUrl,
      resolvedUrl: candidate.resolvedUrl,
      status: result.status,
      ok: result.status >= 200 && result.status < 300,
      declaredType: candidate.declaredType ?? null,
      actualType: result.contentType,
      declaredSizes: candidate.declaredSizes ?? null,
      declaredMedia: candidate.declaredMedia ?? null,
      width: image.width,
      height: image.height,
      sizes: image.sizes,
      isSquare: image.width !== null && image.height !== null
        ? image.width === image.height
        : null,
      bytes: result.body.byteLength,
      usedBy: usageForKind(candidate.kind),
      warnings,
    };
  } catch (error) {
    return {
      id,
      kind: candidate.kind,
      source: candidate.source,
      rel: candidate.rel,
      declaredUrl: candidate.declaredUrl,
      resolvedUrl: candidate.resolvedUrl,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : "Asset inspection failed",
      declaredType: candidate.declaredType ?? null,
      declaredSizes: candidate.declaredSizes ?? null,
      declaredMedia: candidate.declaredMedia ?? null,
      usedBy: usageForKind(candidate.kind),
      warnings: [],
    };
  }
}

function usageForKind(kind: InspectableAssetKind): IconUsage[] {
  switch (kind) {
    case "apple-touch-icon":
      return ["ios-home-screen"];
    case "og-image":
      return ["social-preview"];
    case "twitter-image":
      return ["twitter-card"];
    case "favicon":
    case "default-favicon":
      return ["browser-tab", "google-search"];
    default:
      return [];
  }
}
