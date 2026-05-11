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
