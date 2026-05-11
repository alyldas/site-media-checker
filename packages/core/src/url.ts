import type { ErrorCode } from "./types.ts";

export class UrlError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "UrlError";
  }
}

export function normalizeInputUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new UrlError("invalid_url", "URL is required");
  }

  if (trimmed.length > 2048) {
    throw new UrlError("invalid_url", "URL must be 2048 characters or fewer");
  }

  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new UrlError("invalid_url", "Enter a valid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlError(
      "unsupported_protocol",
      "Only http and https URLs are supported",
    );
  }

  if (url.username || url.password) {
    throw new UrlError(
      "userinfo_not_allowed",
      "URLs with username or password are not allowed",
    );
  }

  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new UrlError(
      "port_not_allowed",
      "Only default HTTP and HTTPS ports are allowed",
    );
  }

  url.hash = "";

  return url.toString();
}

export function resolveUrl(raw: string, baseUrl: string): string | null {
  const value = raw.trim();

  if (!value) {
    return null;
  }

  try {
    const resolved = new URL(value, baseUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return null;
    }
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}
