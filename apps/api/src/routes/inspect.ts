import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { getConfig } from "../utils/config.ts";
import { errorResponse } from "../utils/error-response.ts";
import { normalizeInputUrl, UrlValidationError } from "../utils/url.ts";
import { assertPublicHttpUrl, SsrfError } from "../security/ssrf.ts";
import { buildInspectReport } from "../inspect/build-report.ts";
import { SafeFetchError } from "../inspect/fetch-page.ts";

const inspectBodySchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

export const inspectRoute = new Hono();

inspectRoute.get("/", (c) => {
  const inputUrl = c.req.query("url");

  if (!inputUrl) {
    return c.json(
      errorResponse("invalid_url", "Query parameter url is required"),
      400,
    );
  }

  return inspect(inputUrl, c);
});

inspectRoute.post("/", async (c) => {
  const config = getConfig();
  const contentLength = Number(c.req.header("content-length") ?? 0);

  if (contentLength > config.maxRequestBytes) {
    return c.json(
      errorResponse("request_too_large", "Request body is too large"),
      413,
    );
  }

  const text = await readRequestTextLimited(c.req.raw, config.maxRequestBytes);

  if (text === null) {
    return c.json(
      errorResponse("request_too_large", "Request body is too large"),
      413,
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(text) as unknown;
  } catch {
    return c.json(
      errorResponse("invalid_json", "Request body must be valid JSON"),
      400,
    );
  }

  const parsed = inspectBodySchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(
        "invalid_url",
        "Request body must include a non-empty url string",
      ),
      400,
    );
  }

  return inspect(parsed.data.url, c);
});

async function inspect(inputUrl: string, c: Context) {
  const startedAt = Date.now();
  const config = getConfig();

  try {
    const normalizedUrl = normalizeInputUrl(inputUrl);
    await assertPublicHttpUrl(normalizedUrl, config);
    return c.json(
      await buildInspectReport(inputUrl, normalizedUrl, config, startedAt),
    );
  } catch (error) {
    if (
      error instanceof UrlValidationError || error instanceof SsrfError ||
      error instanceof SafeFetchError
    ) {
      return c.json(
        errorResponse(error.code, error.message),
        statusForErrorCode(error.code),
      );
    }

    throw error;
  }
}

function statusForErrorCode(code: string): 400 | 408 | 413 | 502 | 504 {
  switch (code) {
    case "fetch_timeout":
      return 504;
    case "response_too_large":
    case "html_too_large":
      return 413;
    case "fetch_failed":
      return 502;
    default:
      return 400;
  }
}

async function readRequestTextLimited(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
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
      return null;
    }

    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}
