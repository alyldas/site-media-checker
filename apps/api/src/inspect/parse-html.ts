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
  const links = [...html.matchAll(/<link\b([^>]*)>/gi)]
    .map((match) => parseAttributes(match[1] ?? ""))
    .filter((attrs) => attrs.rel && attrs.href)
    .map((attrs) => ({
      rel: attrs.rel,
      href: attrs.href,
      type: attrs.type ?? null,
      sizes: attrs.sizes ?? null,
      media: attrs.media ?? null,
    }));

  const metas = [...html.matchAll(/<meta\b([^>]*)>/gi)].map((match) =>
    parseAttributes(match[1] ?? "")
  );
  const openGraph: Record<string, string> = {};
  const twitter: Record<string, string> = {};

  for (const attrs of metas) {
    const content = attrs.content;

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
    lang: parseAttributes(html.match(/<html\b([^>]*)>/i)?.[1] ?? "").lang ??
      null,
    title: decodeHtml(
      html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "",
    ) || null,
    description: findMeta(metas, "name", "description"),
    themeColor: findMeta(metas, "name", "theme-color"),
    themeColors: findThemeColors(metas),
    canonical: links.find((link) => hasRelToken(link.rel, "canonical"))?.href ??
      null,
    baseHref: [...html.matchAll(/<base\b([^>]*)>/gi)]
      .map((match) => parseAttributes(match[1] ?? ""))
      .find((attrs) => attrs.href)?.href ?? null,
    links,
    openGraph,
    twitter,
  };
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
      content: attrs.content,
      media: attrs.media ?? null,
    }));
}

function findMeta(
  metas: Array<Record<string, string>>,
  key: "name" | "property",
  value: string,
): string | null {
  return metas.find((attrs) => attrs[key]?.toLowerCase() === value)?.content ??
    null;
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
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
