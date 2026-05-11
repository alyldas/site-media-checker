export interface ParsedHtmlMetadata {
  lang: string | null;
  title: string | null;
  description: string | null;
  themeColor: string | null;
  themeColors: ThemeColorMeta[];
  canonical: string | null;
  baseHref: string | null;
  links: ParsedLink[];
  openGraph: Record<string, string>;
  twitter: Record<string, string>;
}

export interface ThemeColorMeta {
  content: string;
  media: string | null;
}

export interface ParsedLink {
  rel: string;
  href: string;
  type: string | null;
  sizes: string | null;
  media: string | null;
}

export function parseHtmlMetadata(html: string): ParsedHtmlMetadata {
  const links = findTagAttributeText(html, "link")
    .map((attributes) => parseAttributes(attributes))
    .filter((attrs) => normalizeText(attrs.rel) && normalizeText(attrs.href))
    .map((attrs) => ({
      rel: normalizeText(attrs.rel) ?? "",
      href: normalizeText(attrs.href) ?? "",
      type: normalizeText(attrs.type),
      sizes: normalizeText(attrs.sizes),
      media: normalizeText(attrs.media),
    }));

  const metas = findTagAttributeText(html, "meta").map((attributes) =>
    parseAttributes(attributes)
  );
  const openGraph: Record<string, string> = {};
  const twitter: Record<string, string> = {};

  for (const attrs of metas) {
    const content = normalizeText(attrs.content);

    if (!content) {
      continue;
    }

    const property = attrs.property?.toLowerCase();
    const name = attrs.name?.toLowerCase();

    if (property?.startsWith("og:")) {
      openGraph[property] = content;
    }

    if (name?.startsWith("twitter:")) {
      twitter[name] = content;
    }
  }

  return {
    lang: normalizeText(
      parseAttributes(findTagAttributeText(html, "html")[0] ?? "").lang,
    ),
    title: decodeHtml(
      html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "",
    ) || null,
    description: findMeta(metas, "name", "description"),
    themeColor: findMeta(metas, "name", "theme-color"),
    themeColors: findThemeColors(metas),
    canonical: links.find((link) => hasRelToken(link.rel, "canonical"))?.href ??
      null,
    baseHref: normalizeText(
      findTagAttributeText(html, "base")
        .map((attributes) => parseAttributes(attributes))
        .find((attrs) => attrs.href)?.href,
    ),
    links,
    openGraph,
    twitter,
  };
}

function findTagAttributeText(html: string, tagName: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(`<${tagName}\\b`, "gi");

  for (const match of html.matchAll(pattern)) {
    const start = match.index + match[0].length;
    const end = findTagEnd(html, start);

    if (end === -1) {
      continue;
    }

    results.push(html.slice(start, end));
  }

  return results;
}

function findTagEnd(html: string, start: number): number {
  let quote: '"' | "'" | null = null;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === ">") {
      return index;
    }
  }

  return -1;
}

export function hasRelToken(rel: string, token: string): boolean {
  return rel
    .toLowerCase()
    .split(/\s+/)
    .includes(token);
}

function findThemeColors(
  metas: Array<Record<string, string>>,
): ThemeColorMeta[] {
  return metas
    .filter((attrs) =>
      attrs.name?.toLowerCase() === "theme-color" && Boolean(attrs.content)
    )
    .map((attrs) => ({
      content: normalizeText(attrs.content) ?? "",
      media: normalizeText(attrs.media),
    }));
}

function findMeta(
  metas: Array<Record<string, string>>,
  key: "name" | "property",
  value: string,
): string | null {
  return normalizeText(
    metas.find((attrs) => attrs[key]?.toLowerCase() === value)?.content,
  );
}

function parseAttributes(input: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const pattern =
    /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of input.matchAll(pattern)) {
    const name = match[1]?.toLowerCase();

    if (!name) {
      continue;
    }

    attrs[name] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attrs;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10))
    )
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeText(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
