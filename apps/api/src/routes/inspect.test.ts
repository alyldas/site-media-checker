import { assertEquals } from "@std/assert";
import app from "../app.ts";
import type { ErrorResponse } from "../../../../packages/core/src/types.ts";

Deno.test("GET /inspect requires url query parameter", async () => {
  const response = await app.fetch(new Request("http://localhost/inspect"));
  const body = await response.json() as ErrorResponse;

  assertEquals(response.status, 400);
  assertEquals(body.version, "1.0.0");
  assertEquals(body.error.code, "invalid_url");
});

Deno.test("POST /inspect rejects invalid JSON", async () => {
  const response = await app.fetch(
    new Request("http://localhost/inspect", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: "{",
    }),
  );
  const body = await response.json() as ErrorResponse;

  assertEquals(response.status, 400);
  assertEquals(body.error.code, "invalid_json");
});

Deno.test("POST /inspect rejects oversized request bodies", async () => {
  const response = await app.fetch(
    new Request("http://localhost/inspect", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "5000",
      },
      body: JSON.stringify({ url: "https://example.com" }),
    }),
  );
  const body = await response.json() as ErrorResponse;

  assertEquals(response.status, 413);
  assertEquals(body.error.code, "request_too_large");
});

Deno.test("POST /inspect rejects oversized request bodies without content-length", async () => {
  const response = await app.fetch(
    new Request("http://localhost/inspect", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ url: "https://example.com", padding: "x".repeat(5000) }),
    }),
  );
  const body = await response.json() as ErrorResponse;

  assertEquals(response.status, 413);
  assertEquals(body.error.code, "request_too_large");
});

Deno.test("POST /inspect rejects non-HTML page responses", async () => {
  const originalFetch = globalThis.fetch;
  const previousUnsafeFallback = Deno.env.get("ALLOW_UNSAFE_DNS_FALLBACK");
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response("plain text", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    )) as typeof fetch;
  Deno.env.set("ALLOW_UNSAFE_DNS_FALLBACK", "true");

  try {
    const response = await app.fetch(
      new Request("http://localhost/inspect", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url: "https://example.invalid/" }),
      }),
    );
    const body = await response.json() as ErrorResponse;

    assertEquals(response.status, 400);
    assertEquals(body.error.code, "unsupported_content_type");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousUnsafeFallback === undefined) {
      Deno.env.delete("ALLOW_UNSAFE_DNS_FALLBACK");
    } else {
      Deno.env.set("ALLOW_UNSAFE_DNS_FALLBACK", previousUnsafeFallback);
    }
  }
});
