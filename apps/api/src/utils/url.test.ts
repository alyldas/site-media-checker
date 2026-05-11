import { assertEquals, assertThrows } from "@std/assert";
import { normalizeInputUrl } from "./url.ts";

Deno.test("normalizes a hostname-only URL to https", () => {
  assertEquals(normalizeInputUrl("example.com"), "https://example.com/");
});

Deno.test("rejects URLs with username or password", () => {
  assertThrows(
    () => normalizeInputUrl("https://user:pass@example.com"),
    Error,
    "username or password",
  );
});

Deno.test("rejects custom ports", () => {
  assertThrows(
    () => normalizeInputUrl("https://example.com:8443"),
    Error,
    "default HTTP",
  );
});
