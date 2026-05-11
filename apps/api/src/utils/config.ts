export interface ApiConfig {
  allowedOrigins: string[];
  maxHtmlBytes: number;
  maxManifestBytes: number;
  maxAssetBytes: number;
  maxAssetsPerScan: number;
  fetchTimeoutMs: number;
  maxRedirects: number;
  userAgent: string;
  allowUnsafeDnsFallback: boolean;
}

export function getConfig(): ApiConfig {
  return {
    allowedOrigins: splitList(
      readEnv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
      ),
    ),
    maxHtmlBytes: readPositiveInteger("MAX_HTML_BYTES", 1_500_000),
    maxManifestBytes: readPositiveInteger("MAX_MANIFEST_BYTES", 262_144),
    maxAssetBytes: readPositiveInteger("MAX_ASSET_BYTES", 4_000_000),
    maxAssetsPerScan: readPositiveInteger("MAX_ASSETS_PER_SCAN", 30),
    fetchTimeoutMs: readPositiveInteger("FETCH_TIMEOUT_MS", 5_000),
    maxRedirects: readPositiveInteger("MAX_REDIRECTS", 5),
    userAgent: readEnv(
      "USER_AGENT",
      "SiteMediaCheckerBot/1.0 (+https://github.com/site-media-checker/site-media-checker)",
    ),
    allowUnsafeDnsFallback:
      readEnv("ALLOW_UNSAFE_DNS_FALLBACK", "false") === "true",
  };
}

function readEnv(name: string, fallback: string): string {
  return Deno.env.get(name) ?? fallback;
}

function readPositiveInteger(name: string, fallback: number): number {
  const raw = Deno.env.get(name);

  if (!raw) {
    return fallback;
  }

  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
