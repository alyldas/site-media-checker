import { assertRejects } from "@std/assert";
import { assertPublicHttpUrl } from "./ssrf.ts";
import type { ApiConfig } from "../utils/config.ts";

const config: ApiConfig = {
  allowedOrigins: [],
  maxHtmlBytes: 1_500_000,
  maxManifestBytes: 262_144,
  maxAssetBytes: 4_000_000,
  maxAssetsPerScan: 30,
  fetchTimeoutMs: 5_000,
  maxRedirects: 5,
  userAgent: "SiteMediaCheckerBot/1.0",
  allowUnsafeDnsFallback: false,
};

Deno.test("rejects localhost", async () => {
  await assertRejects(
    () => assertPublicHttpUrl("https://localhost/", config),
    Error,
    "Localhost",
  );
});

Deno.test("rejects private IPv4", async () => {
  await assertRejects(
    () => assertPublicHttpUrl("https://192.168.1.10/", config),
    Error,
    "Private",
  );
});

Deno.test("rejects private IPv6", async () => {
  await assertRejects(
    () => assertPublicHttpUrl("https://[::1]/", config),
    Error,
    "Private",
  );
});
