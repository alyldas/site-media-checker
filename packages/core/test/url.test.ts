import { describe, expect, it } from "vitest";
import { normalizeInputUrl, resolveUrl, UrlError } from "../src";

describe("normalizeInputUrl", () => {
  it("adds https when a scheme is missing", () => {
    expect(normalizeInputUrl("example.com/path")).toBe(
      "https://example.com/path",
    );
  });

  it("keeps http and strips fragments", () => {
    expect(normalizeInputUrl(" http://example.com/a#section ")).toBe(
      "http://example.com/a",
    );
  });

  it("rejects unsupported protocols", () => {
    expect(() => normalizeInputUrl("file:///tmp/test.html")).toThrow(UrlError);
  });

  it("rejects URLs with username or password", () => {
    expect(() => normalizeInputUrl("https://user:pass@example.com")).toThrow(
      UrlError,
    );
  });

  it("rejects custom ports", () => {
    expect(() => normalizeInputUrl("https://example.com:8443")).toThrow(
      UrlError,
    );
  });
});

describe("resolveUrl", () => {
  it("resolves relative URLs against a base URL", () => {
    expect(resolveUrl("/favicon.ico", "https://example.com/posts/one")).toBe(
      "https://example.com/favicon.ico",
    );
  });

  it("rejects non-http URLs", () => {
    expect(
      resolveUrl("data:text/plain,test", "https://example.com"),
    ).toBeNull();
  });
});
