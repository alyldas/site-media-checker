import type {
  IconAsset,
  IconUsage,
  ManifestReport,
} from "../../../../packages/core/src/types.ts";
import type { ApiConfig } from "../utils/config.ts";
import { resolveUrl } from "../utils/url.ts";
import { safeFetch } from "./fetch-page.ts";
import { inspectImage } from "./inspect-image.ts";

export type ManifestInspection = ManifestReport;

interface ManifestIconLink {
  src: string;
  resolvedUrl: string;
  sizes?: string;
  type?: string;
  purpose?: string;
}

export async function inspectManifest(
  declaredUrl: string,
  resolvedUrl: string,
  config: ApiConfig,
): Promise<ManifestInspection> {
  try {
    const result = await safeFetch(resolvedUrl, config, {
      timeoutMs: config.fetchTimeoutMs,
      maxBytes: config.maxManifestBytes,
      maxRedirects: config.maxRedirects,
      userAgent: config.userAgent,
      allowedContentTypes: [
        "application/manifest+json",
        "application/json",
        "text/json",
        "*/*",
      ],
    });
    const text = new TextDecoder().decode(result.body);
    const raw = JSON.parse(text) as Record<string, unknown>;
    const iconLinks = Array.isArray(raw.icons)
      ? raw.icons.flatMap((icon) =>
        normalizeManifestIcon(icon, result.finalUrl)
      )
      : [];
    const icons = await Promise.all(
      iconLinks.map((icon, index) =>
        inspectManifestIcon(icon, config, `manifest-icon-${index + 1}`)
      ),
    );

    return {
      declaredUrl,
      resolvedUrl,
      status: result.status,
      ok: result.status >= 200 && result.status < 300,
      contentType: result.contentType,
      validJson: true,
      raw,
      fields: buildManifestFields(raw),
      icons,
      capabilities: {
        hasName: typeof raw.name === "string" && raw.name.length > 0,
        hasShortName: typeof raw.short_name === "string" &&
          raw.short_name.length > 0,
        hasStartUrl: typeof raw.start_url === "string" &&
          raw.start_url.length > 0,
        hasDisplay: typeof raw.display === "string" && raw.display.length > 0,
        has192Icon: iconLinks.some((icon) => hasDeclaredSize(icon.sizes, 192)),
        has512Icon: iconLinks.some((icon) => hasDeclaredSize(icon.sizes, 512)),
        hasMaskableIcon: iconLinks.some((icon) =>
          icon.purpose?.split(/\s+/).includes("maskable")
        ),
      },
    };
  } catch (error) {
    return {
      declaredUrl,
      resolvedUrl,
      status: null,
      ok: false,
      error: error instanceof Error
        ? error.message
        : "Manifest inspection failed",
      validJson: false,
      fields: {},
      icons: [],
      capabilities: {
        hasName: false,
        hasShortName: false,
        hasStartUrl: false,
        hasDisplay: false,
        has192Icon: false,
        has512Icon: false,
        hasMaskableIcon: false,
      },
    };
  }
}

async function inspectManifestIcon(
  icon: ManifestIconLink,
  config: ApiConfig,
  id: string,
): Promise<IconAsset> {
  try {
    const result = await safeFetch(icon.resolvedUrl, config, {
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

    return {
      id,
      kind: "manifest-icon",
      source: "manifest",
      declaredUrl: icon.src,
      resolvedUrl: icon.resolvedUrl,
      status: result.status,
      ok: result.status >= 200 && result.status < 300,
      declaredType: icon.type ?? null,
      actualType: result.contentType,
      declaredSizes: icon.sizes ?? null,
      width: image.width,
      height: image.height,
      sizes: image.sizes,
      isSquare: image.width !== null && image.height !== null
        ? image.width === image.height
        : null,
      bytes: result.body.byteLength,
      purpose: icon.purpose ?? null,
      usedBy: manifestIconUsage(icon.purpose),
      warnings: image.warning ? [image.warning] : [],
    };
  } catch (error) {
    return {
      id,
      kind: "manifest-icon",
      source: "manifest",
      declaredUrl: icon.src,
      resolvedUrl: icon.resolvedUrl,
      status: null,
      ok: false,
      error: error instanceof Error ? error.message : "Asset inspection failed",
      declaredType: icon.type ?? null,
      declaredSizes: icon.sizes ?? null,
      purpose: icon.purpose ?? null,
      usedBy: manifestIconUsage(icon.purpose),
      warnings: [],
    };
  }
}

function normalizeManifestIcon(
  icon: unknown,
  manifestUrl: string,
): ManifestIconLink[] {
  if (!icon || typeof icon !== "object") {
    return [];
  }

  const record = icon as Record<string, unknown>;
  if (typeof record.src !== "string") {
    return [];
  }

  const resolvedUrl = resolveUrl(record.src, manifestUrl);
  if (!resolvedUrl) {
    return [];
  }

  return [
    {
      src: record.src,
      resolvedUrl,
      sizes: typeof record.sizes === "string" ? record.sizes : undefined,
      type: typeof record.type === "string" ? record.type : undefined,
      purpose: typeof record.purpose === "string" ? record.purpose : undefined,
    },
  ];
}

function buildManifestFields(
  raw: Record<string, unknown>,
): ManifestReport["fields"] {
  return {
    name: stringField(raw.name),
    shortName: stringField(raw.short_name),
    startUrl: stringField(raw.start_url),
    scope: stringField(raw.scope),
    display: stringField(raw.display),
    displayOverride: stringArrayField(raw.display_override),
    themeColor: stringField(raw.theme_color),
    backgroundColor: stringField(raw.background_color),
    description: stringField(raw.description),
    lang: stringField(raw.lang),
    dir: stringField(raw.dir),
    preferRelatedApplications: booleanField(raw.prefer_related_applications),
  };
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function stringArrayField(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function booleanField(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function manifestIconUsage(purpose: string | undefined): IconUsage[] {
  return purpose?.split(/\s+/).includes("maskable")
    ? ["android-pwa", "maskable-pwa"]
    : ["android-pwa"];
}

function hasDeclaredSize(sizes: string | undefined, size: number): boolean {
  return sizes?.split(/\s+/).some((entry) => entry === `${size}x${size}`) ??
    false;
}
