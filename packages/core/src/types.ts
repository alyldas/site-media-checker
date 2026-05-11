export type Severity = "ok" | "info" | "warning" | "error";

export type CheckCategory =
  | "page"
  | "favicon"
  | "apple"
  | "manifest"
  | "pwa"
  | "social"
  | "twitter"
  | "security"
  | "performance";

export interface FixSuggestion {
  title: string;
  description: string;
  files?: Array<{
    path: string;
    description: string;
  }>;
  snippets?: Array<{
    label: string;
    language: "html" | "json" | "txt";
    code: string;
  }>;
}

export interface Check {
  id: string;
  title: string;
  severity: Severity;
  message: string;
  category: CheckCategory;
  target?: string;
  fix?: FixSuggestion;
  docsUrl?: string;
}

export interface InspectReport {
  version: string;
  inputUrl: string;
  normalizedUrl: string;
  finalUrl: string | null;
  status: number | null;
  fetchedAt: string;
  durationMs: number;
  score: number;
  page: PageInfo | null;
  icons: IconAsset[];
  manifest: ManifestReport | null;
  social: SocialReport;
  checks: Check[];
  limits: InspectLimits;
}

export interface PageInfo {
  title: string | null;
  description: string | null;
  canonical: string | null;
  themeColor: string | null;
  themeColors?: ThemeColorMeta[];
  lang: string | null;
  baseHref: string | null;
  htmlBytes: number;
  isHttps: boolean;
}

export interface ThemeColorMeta {
  content: string;
  media: string | null;
}

export interface IconAsset {
  id: string;
  kind:
    | "favicon"
    | "apple-touch-icon"
    | "manifest-icon"
    | "og-image"
    | "twitter-image"
    | "default-favicon"
    | "unknown";
  source: "html-link" | "default-path" | "manifest" | "open-graph" | "twitter";
  rel?: string;
  declaredUrl: string;
  resolvedUrl: string;
  status: number | null;
  ok: boolean;
  error?: string;
  declaredType?: string | null;
  actualType?: string | null;
  declaredSizes?: string | null;
  declaredMedia?: string | null;
  width?: number | null;
  height?: number | null;
  sizes?: ImageSize[];
  isSquare?: boolean | null;
  bytes?: number | null;
  purpose?: string | null;
  usedBy: IconUsage[];
  warnings: string[];
}

export interface ImageSize {
  width: number;
  height: number;
}

export type IconUsage =
  | "browser-tab"
  | "google-search"
  | "ios-home-screen"
  | "android-pwa"
  | "maskable-pwa"
  | "social-preview"
  | "twitter-card";

export interface ManifestReport {
  declaredUrl: string;
  resolvedUrl: string;
  status: number | null;
  ok: boolean;
  error?: string;
  contentType?: string | null;
  validJson: boolean;
  raw?: unknown;
  fields: {
    name?: string;
    shortName?: string;
    startUrl?: string;
    scope?: string;
    display?: string;
    displayOverride?: string[];
    themeColor?: string;
    backgroundColor?: string;
    description?: string;
    lang?: string;
    dir?: string;
    preferRelatedApplications?: boolean;
  };
  icons: IconAsset[];
  capabilities: {
    hasName: boolean;
    hasShortName: boolean;
    hasStartUrl: boolean;
    hasDisplay: boolean;
    has192Icon: boolean;
    has512Icon: boolean;
    hasMaskableIcon: boolean;
  };
}

export interface SocialReport {
  openGraph: OpenGraphReport;
  twitter: TwitterReport;
}

export interface OpenGraphReport {
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageSecureUrl?: string | null;
  imageType?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageAlt?: string | null;
  url?: string | null;
  type?: string | null;
  siteName?: string | null;
  imageAsset?: IconAsset | null;
}

export interface TwitterReport {
  card?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  imageAlt?: string | null;
  site?: string | null;
  creator?: string | null;
  imageAsset?: IconAsset | null;
  fallbacks: {
    titleFromOg: boolean;
    descriptionFromOg: boolean;
    imageFromOg: boolean;
  };
}

export interface InspectLimits {
  maxAssets: number;
  assetsDiscovered: number;
  assetsInspected: number;
  truncated: boolean;
  maxHtmlBytes: number;
  maxImageBytes: number;
  maxManifestBytes: number;
}

export interface ErrorResponse {
  version: string;
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type ErrorCode =
  | "invalid_url"
  | "not_found"
  | "unsupported_protocol"
  | "userinfo_not_allowed"
  | "port_not_allowed"
  | "invalid_hostname"
  | "dns_resolution_failed"
  | "blocked_private_address"
  | "fetch_timeout"
  | "fetch_failed"
  | "html_too_large"
  | "response_too_large"
  | "request_too_large"
  | "too_many_redirects"
  | "invalid_json"
  | "internal_error";
