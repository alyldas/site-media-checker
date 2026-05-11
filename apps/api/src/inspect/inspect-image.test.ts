import { assertEquals } from "@std/assert";
import { inspectImage, isRecognizedImage } from "./inspect-image.ts";

Deno.test("parses PNG dimensions", () => {
  const png = new Uint8Array([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52,
    0x00,
    0x00,
    0x00,
    0x10,
    0x00,
    0x00,
    0x00,
    0x20,
  ]);

  assertEquals(inspectImage(png, "image/png"), {
    format: "png",
    width: 16,
    height: 32,
  });
});

Deno.test("marks unknown bytes as unrecognized image data", () => {
  const image = inspectImage(
    new TextEncoder().encode("<html></html>"),
    "text/html",
  );

  assertEquals(image.format, "unknown");
  assertEquals(isRecognizedImage(image), false);
});

Deno.test("parses SVG viewBox dimensions", () => {
  const svg = new TextEncoder().encode(`<svg viewBox="0 0 1200 630"></svg>`);

  assertEquals(inspectImage(svg, "image/svg+xml"), {
    format: "svg",
    width: 1200,
    height: 630,
  });
});

Deno.test("parses SVG viewBox dimensions with comma separators", () => {
  const svg = new TextEncoder().encode(`<svg viewBox="0,0,1200,630"></svg>`);

  assertEquals(inspectImage(svg, "image/svg+xml"), {
    format: "svg",
    width: 1200,
    height: 630,
  });
});

Deno.test("uses SVG viewBox when width and height are percentages", () => {
  const svg = new TextEncoder().encode(
    `<svg width="100%" height="100%" viewBox="0 0 1200 630"></svg>`,
  );

  assertEquals(inspectImage(svg, "image/svg+xml"), {
    format: "svg",
    width: 1200,
    height: 630,
  });
});

Deno.test("parses lossy WebP dimensions", () => {
  const webp = new Uint8Array([
    0x52,
    0x49,
    0x46,
    0x46,
    0x1e,
    0x00,
    0x00,
    0x00,
    0x57,
    0x45,
    0x42,
    0x50,
    0x56,
    0x50,
    0x38,
    0x20,
    0x12,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x9d,
    0x01,
    0x2a,
    0x80,
    0x02,
    0x68,
    0x01,
  ]);

  assertEquals(inspectImage(webp, "image/webp"), {
    format: "webp",
    width: 640,
    height: 360,
  });
});

Deno.test("parses all ICO directory sizes", () => {
  const entries = [
    [0x10, 0x10],
    [0x20, 0x20],
    [0x00, 0x00],
  ];
  const ico = new Uint8Array([
    0x00,
    0x00,
    0x01,
    0x00,
    entries.length,
    0x00,
    ...entries.flatMap(([width, height], index) => [
      width,
      height,
      0x00,
      0x00,
      0x01,
      0x00,
      0x20,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      6 + entries.length * 16 + index,
      0x00,
      0x00,
      0x00,
    ]),
  ]);

  assertEquals(inspectImage(ico, "image/x-icon"), {
    format: "ico",
    width: 16,
    height: 16,
    sizes: [
      { width: 16, height: 16 },
      { width: 32, height: 32 },
      { width: 256, height: 256 },
    ],
  });
});
