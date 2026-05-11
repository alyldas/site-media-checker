// @vitest-environment jsdom
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { inspectUrl } from "./api/client";
import type { InspectReport } from "@site-media-checker/core";

vi.mock("./api/client", () => ({
  inspectUrl: vi.fn(),
}));

describe("App media preview smoke", () => {
  it("renders the main preview sections after inspection", async () => {
    vi.mocked(inspectUrl).mockResolvedValueOnce(reportFixture);

    const wrapper = mount(App);

    await wrapper.get("input#url").setValue("https://pixelplace.ru");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Media Previews");
    });

    expect(wrapper.text()).toContain("Declared browser icons");
    expect(wrapper.text()).toContain("Browser tab");
    expect(wrapper.text()).toContain("iOS home screen");
    expect(wrapper.text()).toContain("Android home screen");
    expect(wrapper.text()).toContain("Search result");
    expect(wrapper.text()).toContain("Social platform previews");
    expect(wrapper.text()).toContain("Chrome");
    expect(wrapper.text()).toContain("Safari");
    expect(wrapper.text()).toContain("Firefox");
    expect(wrapper.text()).toContain("X / Twitter");
    expect(wrapper.text()).toContain("Facebook");
    expect(wrapper.text()).toContain("Telegram");
    expect(wrapper.text()).toContain("Instagram");
    expect(wrapper.text()).toContain("Checks");
    expect(wrapper.findAll(".browser-shot")).toHaveLength(6);
    expect(wrapper.findAll(".phone-frame")).toHaveLength(4);
    expect(wrapper.findAll(".phone-island")).toHaveLength(2);
    expect(wrapper.findAll(".phone-camera-cutout")).toHaveLength(2);
  });

  it("shows API errors and clears stale reports", async () => {
    vi.mocked(inspectUrl).mockRejectedValueOnce(new Error("Invalid URL"));

    const wrapper = mount(App);

    await wrapper.get("input#url").setValue("not-a-url");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain("Invalid URL");
    });

    expect(wrapper.find("[role='alert']").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Media Previews");
  });

  it("submits hostname-only input so the API can normalize it", async () => {
    vi.mocked(inspectUrl).mockResolvedValueOnce(reportFixture);

    const wrapper = mount(App);
    const input = wrapper.get<HTMLInputElement>("input#url");

    expect(input.element.type).toBe("text");
    expect(input.attributes("inputmode")).toBe("url");

    await input.setValue("example.com");
    await wrapper.get("form").trigger("submit");
    await vi.waitFor(() => {
      expect(inspectUrl).toHaveBeenCalledWith("example.com");
    });
  });
});

const reportFixture: InspectReport = {
  version: "test",
  inputUrl: "https://pixelplace.ru",
  normalizedUrl: "https://pixelplace.ru/",
  finalUrl: "https://pixelplace.ru/",
  status: 200,
  fetchedAt: "2026-05-11T00:00:00.000Z",
  durationMs: 42,
  score: 90,
  page: {
    title: "PixelPlace",
    description: "Draw pixels online.",
    canonical: "https://pixelplace.ru/",
    themeColor: "#ffffff",
    lang: "ru",
    baseHref: null,
    htmlBytes: 1234,
    isHttps: true,
  },
  icons: [
    {
      id: "favicon-svg",
      kind: "favicon",
      source: "html-link",
      rel: "icon",
      declaredUrl: "/favicon.svg",
      resolvedUrl: "https://pixelplace.ru/favicon.svg",
      status: 200,
      ok: true,
      actualType: "image/svg+xml",
      declaredType: "image/svg+xml",
      declaredSizes: null,
      declaredMedia: null,
      width: 512,
      height: 512,
      isSquare: true,
      bytes: 500,
      usedBy: ["browser-tab", "google-search"],
      warnings: [],
    },
    {
      id: "apple",
      kind: "apple-touch-icon",
      source: "html-link",
      rel: "apple-touch-icon",
      declaredUrl: "/apple-touch-icon.png",
      resolvedUrl: "https://pixelplace.ru/apple-touch-icon.png",
      status: 200,
      ok: true,
      actualType: "image/png",
      declaredType: null,
      declaredSizes: "180x180",
      declaredMedia: null,
      width: 180,
      height: 180,
      isSquare: true,
      bytes: 500,
      usedBy: ["ios-home-screen"],
      warnings: [],
    },
  ],
  manifest: {
    declaredUrl: "/manifest.webmanifest",
    resolvedUrl: "https://pixelplace.ru/manifest.webmanifest",
    status: 200,
    ok: true,
    contentType: "application/manifest+json",
    validJson: true,
    fields: {
      name: "PixelPlace",
      shortName: "PixelPlace",
      description: "Draw pixels online.",
      display: "standalone",
      startUrl: "/",
      scope: "/",
    },
    icons: [
      {
        id: "manifest-192",
        kind: "manifest-icon",
        source: "manifest",
        declaredUrl: "/android-chrome-192x192.png",
        resolvedUrl: "https://pixelplace.ru/android-chrome-192x192.png",
        status: 200,
        ok: true,
        actualType: "image/png",
        declaredType: "image/png",
        declaredSizes: "192x192",
        declaredMedia: null,
        width: 192,
        height: 192,
        sizes: [{ width: 192, height: 192 }],
        isSquare: true,
        bytes: 500,
        purpose: "any",
        usedBy: ["android-pwa"],
        warnings: [],
      },
    ],
    capabilities: {
      hasName: true,
      hasShortName: true,
      hasStartUrl: true,
      hasDisplay: true,
      has192Icon: true,
      has512Icon: false,
      hasMaskableIcon: false,
    },
  },
  social: {
    openGraph: {
      title: "PixelPlace",
      description: "Draw pixels online.",
      image: "https://pixelplace.ru/og.png",
      imageAsset: {
        id: "og",
        kind: "og-image",
        source: "open-graph",
        declaredUrl: "https://pixelplace.ru/og.png",
        resolvedUrl: "https://pixelplace.ru/og.png",
        status: 200,
        ok: true,
        actualType: "image/png",
        declaredType: "image/png",
        declaredSizes: null,
        declaredMedia: null,
        width: 1200,
        height: 630,
        isSquare: false,
        bytes: 500,
        usedBy: ["social-preview"],
        warnings: [],
      },
    },
    twitter: {
      card: "summary_large_image",
      title: "PixelPlace",
      description: "Draw pixels online.",
      image: "https://pixelplace.ru/og.png",
      fallbacks: {
        titleFromOg: true,
        descriptionFromOg: true,
        imageFromOg: true,
      },
    },
  },
  checks: [
    {
      id: "favicon.reachable",
      title: "Favicon",
      severity: "ok",
      message: "At least one favicon is reachable.",
      category: "favicon",
    },
  ],
  limits: {
    maxAssets: 20,
    assetsDiscovered: 3,
    assetsInspected: 3,
    truncated: false,
    maxHtmlBytes: 1_000_000,
    maxImageBytes: 1_000_000,
    maxManifestBytes: 1_000_000,
  },
};
