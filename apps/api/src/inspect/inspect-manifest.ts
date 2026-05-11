import type {
  IconAsset,
  IconUsage,
  ManifestReport,
} from "../../../../packages/core/src/types.ts";
import type { ApiConfig } from "../utils/config.ts";
import { resolveUrl } from "../utils/url.ts";
import { safeFetch, SafeFetchError } from "./fetch-page.ts";
import { inspectImage, isRecognizedImage } from "./inspect-image.ts";

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
        "application/x-web-app-manifest+json",
        "application/json",
        "text/json",
      ],
    });
    const text = new TextDecoder().decode(result.body);
    let parsed: unknown;

    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      return failedManifestInspection(
        declaredUrl,
        resolvedUrl,
        "Manifest is not valid JSON",
        result.status,
        result.contentType,
      );
    }

    if (!isManifestObject(parsed)) {
      return failedManifestInspection(
        declaredUrl,
        resolvedUrl,
        "Manifest JSON must be an object",
        result.status,
        result.contentType,
      );
    }

    const raw = parsed;
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
        has192Icon: icons.some((icon) => icon.ok && hasIconSize(icon, 192)),
        has512Icon: icons.some((icon) => icon.ok && hasIconSize(icon, 512)),
        hasMaskableIcon: icons.some((icon) =>
          icon.ok && icon.purpose?.split(/\s+/).includes("maskable")
        ),
      },
    };
  } catch (error) {
    return failedManifestInspection(
      declaredUrl,
      resolvedUrl,
      publicInspectionError(error, "Manifest inspection failed"),
    );
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
        "application/octet-stream",
      ],
    });
    const image = inspectImage(result.body, result.contentType);
    const ok = result.status >= 200 && result.status < 300 &&
      isRecognizedImage(image);

    return {
      id,
      kind: "manifest-icon",
      source: "manifest",
      declaredUrl: icon.src,
      resolvedUrl: icon.resolvedUrl,
      status: result.status,
      ok,
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
      error: publicInspectionError(error, "Asset inspection failed"),
      declaredType: icon.type ?? null,
      declaredSizes: icon.sizes ?? null,
      purpose: icon.purpose ?? null,
      usedBy: manifestIconUsage(icon.purpose),
      warnings: [],
    };
  }
}

function failedManifestInspection(
  declaredUrl: string,
  resolvedUrl: string,
  error: string,
  status: number | null = null,
  contentType: string | null = null,
): ManifestInspection {
  return {
    declaredUrl,
    resolvedUrl,
    status,
    ok: false,
    error,
    contentType,
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

function publicInspectionError(error: unknown, fallback: string): string {
  return error instanceof SafeFetchError ? error.message : fallback;
}

function isManifestObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function hasIconSize(icon: IconAsset, size: number): boolean {
  if (icon.width === size && icon.height === size) {
    return true;
  }

  if (
    icon.sizes?.some((entry) => entry.width === size && entry.height === size)
  ) {
    return true;
  }

  return hasDeclaredSize(icon.declaredSizes ?? undefined, size);
}
