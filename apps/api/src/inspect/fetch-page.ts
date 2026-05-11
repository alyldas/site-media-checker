import type { ApiConfig } from "../utils/config.ts";
import type { ErrorCode } from "../../../../packages/core/src/types.ts";
import { headersToRecord } from "../utils/headers.ts";
import { assertPublicHttpUrl, SsrfError } from "../security/ssrf.ts";

export class SafeFetchError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SafeFetchError";
  }
}

export interface SafeFetchOptions {
  timeoutMs: number;
  maxBytes: number;
  maxRedirects: number;
  allowedContentTypes?: string[];
  userAgent: string;
}

export interface SafeFetchResult {
  url: string;
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  body: Uint8Array;
  contentType: string | null;
  redirected: boolean;
  redirects: Array<{
    from: string;
    to: string;
    status: number;
  }>;
}

export function fetchPageHtml(
  url: string,
  config: ApiConfig,
): Promise<SafeFetchResult> {
  return safeFetch(url, config, {
    timeoutMs: config.fetchTimeoutMs,
    maxBytes: config.maxHtmlBytes,
    maxRedirects: config.maxRedirects,
    allowedContentTypes: ["text/html", "application/xhtml+xml"],
    userAgent: config.userAgent,
  });
}

export async function safeFetch(
  url: string,
  config: ApiConfig,
  options: SafeFetchOptions,
): Promise<SafeFetchResult> {
  let currentUrl = url;
  const redirects: SafeFetchResult["redirects"] = [];

  for (let index = 0; index <= options.maxRedirects; index += 1) {
    await assertPublicHttpUrl(currentUrl, config);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "accept": options.allowedContentTypes?.join(",") ?? "*/*",
          "user-agent": options.userAgent,
        },
      });

      const location = response.headers.get("location");
      if (isRedirect(response.status) && location) {
        if (index === options.maxRedirects) {
          throw new SafeFetchError("too_many_redirects", "Too many redirects");
        }

        const nextUrl = new URL(location, currentUrl).toString();
        await assertPublicHttpUrl(nextUrl, config);
        redirects.push({
          from: currentUrl,
          to: nextUrl,
          status: response.status,
        });
        currentUrl = nextUrl;
        continue;
      }

      const contentType = response.headers.get("content-type");
      assertAllowedContentType(contentType, options.allowedContentTypes);
      const body = await readLimited(response, options.maxBytes);

      return {
        url,
        finalUrl: currentUrl,
        status: response.status,
        headers: headersToRecord(response.headers),
        body,
        contentType,
        redirected: redirects.length > 0,
        redirects,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new SafeFetchError("fetch_timeout", "Fetch timed out");
      }

      if (error instanceof SafeFetchError) {
        throw error;
      }

      if (error instanceof SsrfError) {
        throw error;
      }

      throw new SafeFetchError("fetch_failed", "Fetch failed");
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new SafeFetchError("too_many_redirects", "Too many redirects");
}

function assertAllowedContentType(
  contentType: string | null,
  allowedContentTypes: string[] | undefined,
): void {
  if (
    !contentType || !allowedContentTypes || allowedContentTypes.includes("*/*")
  ) {
    return;
  }

  const normalized = contentType.split(";")[0]?.trim().toLowerCase();
  const allowed = allowedContentTypes.map((type) => type.toLowerCase());

  if (!normalized || allowed.includes(normalized)) {
    return;
  }

  throw new SafeFetchError(
    "unsupported_content_type",
    `Unsupported content type: ${contentType}`,
  );
}

async function readLimited(
  response: Response,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!response.body) {
    return new Uint8Array();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new SafeFetchError("response_too_large", "Response is too large");
    }

    chunks.push(value);
  }

  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return output;
}

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}
