import { assertRejects } from "@std/assert";
import { safeFetch } from "./fetch-page.ts";
import type { ApiConfig } from "../utils/config.ts";

const config: ApiConfig = {
  allowedOrigins: [],
  maxHtmlBytes: 1_500_000,
  maxManifestBytes: 262_144,
  maxAssetBytes: 4_000_000,
  maxRequestBytes: 4096,
  maxAssetsPerScan: 30,
  fetchTimeoutMs: 5,
  maxRedirects: 5,
  userAgent: "SiteMediaCheckerBot/1.0",
  allowUnsafeDnsFallback: true,
};

Deno.test("safeFetch timeout covers response body reads", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = ((_: string | URL | Request, init?: RequestInit) => {
    const signal = init?.signal;
    return Promise.resolve(
      new Response(
        new ReadableStream({
          async pull(controller) {
            await new Promise((resolve) => setTimeout(resolve, 25));
            if (signal?.aborted) {
              throw new DOMException("The operation was aborted", "AbortError");
            }
            controller.enqueue(new TextEncoder().encode("<html></html>"));
            controller.close();
          },
        }),
        {
          status: 200,
          headers: { "content-type": "text/html" },
        },
      ),
    );
  }) as typeof fetch;

  try {
    await assertRejects(
      () =>
        safeFetch("https://example.invalid/", config, {
          timeoutMs: 5,
          maxBytes: 1024,
          maxRedirects: 0,
          allowedContentTypes: ["text/html"],
          userAgent: "test",
        }),
      Error,
      "Fetch timed out",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
