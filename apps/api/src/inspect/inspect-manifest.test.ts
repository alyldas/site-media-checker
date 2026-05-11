import { assertEquals } from "@std/assert";
import { inspectManifest } from "./inspect-manifest.ts";
import type { ApiConfig } from "../utils/config.ts";

const config: ApiConfig = {
  allowedOrigins: [],
  maxHtmlBytes: 1_500_000,
  maxManifestBytes: 262_144,
  maxAssetBytes: 4_000_000,
  maxRequestBytes: 4096,
  maxAssetsPerScan: 30,
  fetchTimeoutMs: 5_000,
  maxRedirects: 5,
  userAgent: "SiteMediaCheckerBot/1.0",
  allowUnsafeDnsFallback: true,
};

Deno.test("invalid manifest JSON keeps HTTP response metadata", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response("not json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )) as typeof fetch;

  try {
    const manifest = await inspectManifest(
      "/manifest.json",
      "https://example.invalid/manifest.json",
      config,
    );

    assertEquals(manifest.status, 200);
    assertEquals(manifest.contentType, "application/json");
    assertEquals(manifest.validJson, false);
    assertEquals(manifest.error, "Manifest is not valid JSON");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("manifest rejects unsupported response content types", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response("<html></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    )) as typeof fetch;

  try {
    const manifest = await inspectManifest(
      "/manifest.json",
      "https://example.invalid/manifest.json",
      config,
    );

    assertEquals(manifest.status, null);
    assertEquals(manifest.validJson, false);
    assertEquals(manifest.error, "Unsupported content type: text/html");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

Deno.test("manifest rejects non-object JSON roots", async () => {
  const originalFetch = globalThis.fetch;

  for (const body of ["null", "[]", '"manifest"']) {
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(body, {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )) as typeof fetch;

    const manifest = await inspectManifest(
      "/manifest.json",
      "https://example.invalid/manifest.json",
      config,
    );

    assertEquals(manifest.status, 200);
    assertEquals(manifest.contentType, "application/json");
    assertEquals(manifest.validJson, false);
    assertEquals(manifest.error, "Manifest JSON must be an object");
  }

  globalThis.fetch = originalFetch;
});
