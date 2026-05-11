import { hasRelToken, type ParsedHtmlMetadata } from "./parse-html.ts";
import { resolveUrl } from "../utils/url.ts";

export interface AssetCandidate {
  kind:
    | "favicon"
    | "apple-touch-icon"
    | "manifest"
    | "og-image"
    | "twitter-image"
    | "default-favicon";
  source: "html-link" | "default-path" | "open-graph" | "twitter";
  declaredUrl: string;
  resolvedUrl: string;
  rel?: string;
  declaredType?: string | null;
  declaredSizes?: string | null;
  declaredMedia?: string | null;
}

export function collectAssetCandidates(
  meta: ParsedHtmlMetadata,
  finalUrl: string,
): AssetCandidate[] {
  const baseUrl = meta.baseHref
    ? resolveUrl(meta.baseHref, finalUrl) ?? finalUrl
    : finalUrl;
  const candidates: AssetCandidate[] = [];

  for (const link of meta.links) {
    const resolvedUrl = resolveUrl(link.href, baseUrl);

    if (!resolvedUrl) {
      continue;
    }

    if (hasRelToken(link.rel, "manifest")) {
      candidates.push({
        kind: "manifest",
        source: "html-link",
        declaredUrl: link.href,
        resolvedUrl,
        rel: link.rel,
        declaredType: link.type,
        declaredSizes: link.sizes,
        declaredMedia: link.media,
      });
    }

    if (hasRelToken(link.rel, "icon") || hasRelToken(link.rel, "shortcut")) {
      candidates.push({
        kind: "favicon",
        source: "html-link",
        declaredUrl: link.href,
        resolvedUrl,
        rel: link.rel,
        declaredType: link.type,
        declaredSizes: link.sizes,
        declaredMedia: link.media,
      });
    }

    if (
      hasRelToken(link.rel, "apple-touch-icon") ||
      hasRelToken(link.rel, "apple-touch-icon-precomposed")
    ) {
      candidates.push({
        kind: "apple-touch-icon",
        source: "html-link",
        declaredUrl: link.href,
        resolvedUrl,
        rel: link.rel,
        declaredType: link.type,
        declaredSizes: link.sizes,
        declaredMedia: link.media,
      });
    }
  }

  const ogImage = meta.openGraph["og:image:secure_url"] ??
    meta.openGraph["og:image:url"] ?? meta.openGraph["og:image"];
  const twitterImage = meta.twitter["twitter:image"];

  if (ogImage) {
    const resolvedUrl = resolveUrl(ogImage, baseUrl);
    if (resolvedUrl) {
      candidates.push({
        kind: "og-image",
        source: "open-graph",
        declaredUrl: ogImage,
        resolvedUrl,
      });
    }
  }

  if (twitterImage) {
    const resolvedUrl = resolveUrl(twitterImage, baseUrl);
    if (resolvedUrl) {
      candidates.push({
        kind: "twitter-image",
        source: "twitter",
        declaredUrl: twitterImage,
        resolvedUrl,
      });
    }
  }

  for (const path of ["/favicon.ico", "/favicon.svg", "/favicon.png"]) {
    const resolvedUrl = resolveUrl(path, finalUrl);
    if (resolvedUrl) {
      candidates.push({
        kind: "default-favicon",
        source: "default-path",
        declaredUrl: path,
        resolvedUrl,
      });
    }
  }

  const appleFallback = resolveUrl("/apple-touch-icon.png", finalUrl);
  if (appleFallback) {
    candidates.push({
      kind: "apple-touch-icon",
      source: "default-path",
      declaredUrl: "/apple-touch-icon.png",
      resolvedUrl: appleFallback,
    });
  }

  return dedupeCandidates(candidates);
}

function dedupeCandidates(candidates: AssetCandidate[]): AssetCandidate[] {
  const seen = new Set<string>();
  const result: AssetCandidate[] = [];

  for (const candidate of candidates) {
    const key = `${candidate.kind}:${candidate.resolvedUrl}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(candidate);
  }

  return result;
}
