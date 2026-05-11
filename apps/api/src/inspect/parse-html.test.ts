import { assertEquals } from "@std/assert";
import { hasRelToken, parseHtmlMetadata } from "./parse-html.ts";

Deno.test("parses icons, manifest and Apple Touch Icon links", () => {
  const parsed = parseHtmlMetadata(`
    <html lang="en">
      <head>
        <base href="https://example.com/base/">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="icon" href="/favicon-dark.svg" media="(prefers-color-scheme: dark)">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">
      </head>
    </html>
  `);

  assertEquals(parsed.lang, "en");
  assertEquals(parsed.baseHref, "https://example.com/base/");
  assertEquals(
    parsed.links.some((link) => hasRelToken(link.rel, "icon")),
    true,
  );
  assertEquals(
    parsed.links.find((link) => link.href === "/favicon-dark.svg")?.media,
    "(prefers-color-scheme: dark)",
  );
  assertEquals(
    parsed.links.some((link) => hasRelToken(link.rel, "manifest")),
    true,
  );
  assertEquals(
    parsed.links.some((link) => hasRelToken(link.rel, "apple-touch-icon")),
    true,
  );
});

Deno.test("parses Open Graph and Twitter tags", () => {
  const parsed = parseHtmlMetadata(`
    <title>Example</title>
    <meta name="description" content="Example description">
    <meta property="og:title" content="OG title">
    <meta property="og:image" content="/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="/twitter.png">
  `);

  assertEquals(parsed.title, "Example");
  assertEquals(parsed.description, "Example description");
  assertEquals(parsed.openGraph["og:title"], "OG title");
  assertEquals(parsed.openGraph["og:image"], "/og.png");
  assertEquals(parsed.twitter["twitter:card"], "summary_large_image");
  assertEquals(parsed.twitter["twitter:image"], "/twitter.png");
});

Deno.test("parses light and dark theme colors", () => {
  const parsed = parseHtmlMetadata(`
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)">
  `);

  assertEquals(parsed.themeColor, "#ffffff");
  assertEquals(parsed.themeColors, [
    { content: "#ffffff", media: "(prefers-color-scheme: light)" },
    { content: "#111827", media: "(prefers-color-scheme: dark)" },
  ]);
});
