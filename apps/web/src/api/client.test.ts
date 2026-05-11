import { afterEach, describe, expect, it, vi } from "vitest";
import { inspectUrl } from "./client";

describe("inspectUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a stable error when API responds with non-JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Gateway timeout", {
          status: 504,
          headers: { "content-type": "text/plain" },
        }),
      ),
    );

    await expect(inspectUrl("https://example.com")).rejects.toThrow(
      "Inspection failed.",
    );
  });

  it("uses API error messages from JSON responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            version: "1.0.0",
            error: {
              code: "invalid_url",
              message: "Enter a valid URL",
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(inspectUrl("not-a-url")).rejects.toThrow("Enter a valid URL");
  });
});
