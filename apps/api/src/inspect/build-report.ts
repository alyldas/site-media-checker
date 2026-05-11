import { calculateScore as calculateScoreSummary } from "../../../../packages/core/src/score.ts";
import type { InspectReport } from "../../../../packages/core/src/types.ts";
import type { ApiConfig } from "../utils/config.ts";
import { fetchPageHtml } from "./fetch-page.ts";
import { inspectAsset, type InspectedAsset } from "./inspect-asset.ts";
import {
  inspectManifest,
  type ManifestInspection,
} from "./inspect-manifest.ts";
import { type ParsedHtmlMetadata, parseHtmlMetadata } from "./parse-html.ts";
import {
  type AssetCandidate,
  collectAssetCandidates,
} from "./resolve-assets.ts";
import { buildChecks } from "./checks.ts";

export async function buildInspectReport(
  inputUrl: string,
  normalizedUrl: string,
  config: ApiConfig,
  startedAt: number,
): Promise<InspectReport> {
  const pageFetch = await fetchPageHtml(normalizedUrl, config);
  const html = new TextDecoder().decode(pageFetch.body);
  const pageMeta = parseHtmlMetadata(html);
  const candidates = collectAssetCandidates(pageMeta, pageFetch.finalUrl);
  const manifest = await inspectManifestCandidate(candidates, config);
  const assetCandidates = candidates
    .filter(isInspectableAssetCandidate)
    .slice(0, config.maxAssetsPerScan);
  const assets = await Promise.all(
    assetCandidates.map((candidate, index) =>
      inspectAsset(candidate, config, `asset-${index + 1}`)
    ),
  );
  const isHttps = pageFetch.finalUrl.startsWith("https://");
  const checks = buildChecks(
    pageMeta,
    assets,
    manifest,
    pageFetch.status,
    isHttps,
  );

  return {
    version: "1.0.0",
    inputUrl,
    normalizedUrl,
    finalUrl: pageFetch.finalUrl,
    status: pageFetch.status,
    fetchedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    score: calculateScoreSummary(checks).score,
    page: {
      title: pageMeta.title,
      description: pageMeta.description,
      canonical: pageMeta.canonical,
      themeColor: pageMeta.themeColor,
      themeColors: pageMeta.themeColors,
      lang: pageMeta.lang,
      baseHref: pageMeta.baseHref,
      htmlBytes: pageFetch.body.byteLength,
      isHttps,
    },
    icons: assets,
    manifest,
    social: buildSocialReport(pageMeta, assets),
    checks,
    limits: {
      maxAssets: config.maxAssetsPerScan,
      assetsDiscovered: candidates.length,
      assetsInspected: assets.length,
      truncated: candidates.length > config.maxAssetsPerScan,
      maxHtmlBytes: config.maxHtmlBytes,
      maxImageBytes: config.maxAssetBytes,
      maxManifestBytes: config.maxManifestBytes,
    },
  };
}

function isInspectableAssetCandidate(
  candidate: AssetCandidate,
): candidate is AssetCandidate & {
  kind: Exclude<AssetCandidate["kind"], "manifest">;
} {
  return candidate.kind !== "manifest";
}

function inspectManifestCandidate(
  candidates: AssetCandidate[],
  config: ApiConfig,
): Promise<ManifestInspection> | null {
  const manifestCandidate = candidates.find((candidate) =>
    candidate.kind === "manifest"
  );

  if (!manifestCandidate) {
    return null;
  }

  return inspectManifest(
    manifestCandidate.declaredUrl,
    manifestCandidate.resolvedUrl,
    config,
  );
}

function buildSocialReport(
  pageMeta: ParsedHtmlMetadata,
  assets: InspectedAsset[],
) {
  const twitterTitle = pageMeta.twitter["twitter:title"];
  const twitterDescription = pageMeta.twitter["twitter:description"];
  const twitterImage = pageMeta.twitter["twitter:image"];
  const ogTitle = pageMeta.openGraph["og:title"];
  const ogDescription = pageMeta.openGraph["og:description"];
  const ogImage = pageMeta.openGraph["og:image:secure_url"] ??
    pageMeta.openGraph["og:image:url"] ?? pageMeta.openGraph["og:image"];

  return {
    openGraph: {
      title: ogTitle ?? null,
      description: ogDescription ?? null,
      image: ogImage ?? null,
      imageSecureUrl: pageMeta.openGraph["og:image:secure_url"] ?? null,
      imageType: pageMeta.openGraph["og:image:type"] ?? null,
      imageWidth: numberOrNull(pageMeta.openGraph["og:image:width"]),
      imageHeight: numberOrNull(pageMeta.openGraph["og:image:height"]),
      imageAlt: pageMeta.openGraph["og:image:alt"] ?? null,
      url: pageMeta.openGraph["og:url"] ?? null,
      type: pageMeta.openGraph["og:type"] ?? null,
      siteName: pageMeta.openGraph["og:site_name"] ?? null,
      imageAsset: assets.find((asset) => asset.kind === "og-image") ?? null,
    },
    twitter: {
      card: pageMeta.twitter["twitter:card"] ?? null,
      title: twitterTitle ?? ogTitle ?? null,
      description: twitterDescription ?? ogDescription ?? null,
      image: twitterImage ?? ogImage ?? null,
      imageAlt: pageMeta.twitter["twitter:image:alt"] ?? null,
      site: pageMeta.twitter["twitter:site"] ?? null,
      creator: pageMeta.twitter["twitter:creator"] ?? null,
      imageAsset: assets.find((asset) => asset.kind === "twitter-image") ??
        null,
      fallbacks: {
        titleFromOg: !twitterTitle && Boolean(ogTitle),
        descriptionFromOg: !twitterDescription && Boolean(ogDescription),
        imageFromOg: !twitterImage && Boolean(ogImage),
      },
    },
  };
}

function numberOrNull(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}
