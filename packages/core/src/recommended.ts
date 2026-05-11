import type { FixSuggestion } from "./types.ts";

export const RECOMMENDED_ASSETS = [
  "/favicon.ico",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/site.webmanifest",
  "/og-image.png",
] as const;

export const RECOMMENDED_HTML = `<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#ffffff">`;

export const RECOMMENDED_SOCIAL_HTML = `<meta property="og:type" content="website">
<meta property="og:title" content="Page title">
<meta property="og:description" content="Page description">
<meta property="og:image" content="https://example.com/og-image.png">
<meta property="og:url" content="https://example.com/">
<meta name="twitter:card" content="summary_large_image">`;

export const RECOMMENDED_MEDIA_FIX: FixSuggestion = {
  title: "Add a modern media metadata baseline",
  description:
    "Declare browser icons, an Apple Touch Icon, a web app manifest and basic social preview tags.",
  files: [
    {
      path: "index.html",
      description: "Add these tags inside the document head.",
    },
  ],
  snippets: [
    {
      label: "Icon and manifest tags",
      language: "html",
      code: RECOMMENDED_HTML,
    },
    {
      label: "Social preview tags",
      language: "html",
      code: RECOMMENDED_SOCIAL_HTML,
    },
  ],
};
