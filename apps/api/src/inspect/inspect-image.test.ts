import { assertEquals } from "@std/assert";
import { inspectImage } from "./inspect-image.ts";

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

Deno.test("parses SVG viewBox dimensions", () => {
  const svg = new TextEncoder().encode(`<svg viewBox="0 0 1200 630"></svg>`);

  assertEquals(inspectImage(svg, "image/svg+xml"), {
    format: "svg",
    width: 1200,
    height: 630,
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
