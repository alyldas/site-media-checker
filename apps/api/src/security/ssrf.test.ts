import { assertEquals, assertRejects } from "@std/assert";
import { assertPublicHttpUrl } from "./ssrf.ts";
import { isBlockedIpAddress } from "./ip.ts";
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

Deno.test("rejects expanded IPv4-mapped private IPv6", async () => {
  await assertRejects(
    () => assertPublicHttpUrl("https://[0:0:0:0:0:ffff:127.0.0.1]/", config),
    Error,
    "Private",
  );
});

Deno.test("rejects IPv4-compatible private IPv6", async () => {
  await assertRejects(
    () => assertPublicHttpUrl("https://[::7f00:1]/", config),
    Error,
    "Private",
  );
});

Deno.test("does not reject public IPv6 addresses as embedded IPv4", () => {
  assertEquals(isBlockedIpAddress("2606:4700:4700::1111"), false);
  assertEquals(isBlockedIpAddress("2001:4860:4860::8888"), false);
  assertEquals(isBlockedIpAddress("2001:19f0::1"), false);
  assertEquals(isBlockedIpAddress("2001:db80::1"), false);
});

Deno.test("rejects reserved IPv6 CIDR ranges precisely", () => {
  assertEquals(isBlockedIpAddress("::ffff:8.8.8.8"), true);
  assertEquals(isBlockedIpAddress("64:ff9b::808:808"), true);
  assertEquals(isBlockedIpAddress("100::1"), true);
  assertEquals(isBlockedIpAddress("2001::1"), true);
  assertEquals(isBlockedIpAddress("2001:1ff::1"), true);
  assertEquals(isBlockedIpAddress("2001:200::1"), false);
  assertEquals(isBlockedIpAddress("2001:db8::1"), true);
  assertEquals(isBlockedIpAddress("fc00::1"), true);
  assertEquals(isBlockedIpAddress("fe80::1"), true);
  assertEquals(isBlockedIpAddress("ff02::1"), true);
});
