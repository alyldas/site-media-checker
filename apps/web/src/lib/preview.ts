import {
  CalendarDays,
  Camera,
  FileJson,
  Globe2,
  Home,
  Mail,
  MapPinned,
  MessageCircle,
  Music2,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-vue-next";
import type { IconAsset } from "@site-media-checker/core";

export type PreviewAsset = IconAsset;

export type FaviconAssetGroup = {
  key: string;
  title: string;
  description: string;
  assets: PreviewAsset[];
  className: string;
};

export type FaviconAssetGroupDefinition = Omit<FaviconAssetGroup, "assets"> & {
  matches: (asset: PreviewAsset) => boolean;
};

export type HomeScreenApp = {
  label: string;
  icon: LucideIcon;
  className: string;
};

export const iosSampleApps: HomeScreenApp[] = [
  { label: "Calendar", icon: CalendarDays, className: "bg-white text-red-500" },
  { label: "Camera", icon: Camera, className: "bg-stone-100 text-stone-800" },
  { label: "Mail", icon: Mail, className: "bg-sky-500 text-white" },
  { label: "Maps", icon: MapPinned, className: "bg-emerald-500 text-white" },
  { label: "Music", icon: Music2, className: "bg-rose-500 text-white" },
  {
    label: "Messages",
    icon: MessageCircle,
    className: "bg-green-500 text-white",
  },
  { label: "Safari", icon: Globe2, className: "bg-blue-500 text-white" },
  { label: "Files", icon: FileJson, className: "bg-sky-100 text-blue-700" },
  { label: "Home", icon: Home, className: "bg-orange-500 text-white" },
  {
    label: "Settings",
    icon: Settings,
    className: "bg-stone-200 text-stone-800",
  },
  { label: "Search", icon: Search, className: "bg-indigo-500 text-white" },
];

export const androidSampleApps: HomeScreenApp[] = [
  {
    label: "Calendar",
    icon: CalendarDays,
    className: "bg-blue-500 text-white",
  },
  { label: "Camera", icon: Camera, className: "bg-stone-900 text-white" },
  { label: "Mail", icon: Mail, className: "bg-red-500 text-white" },
  { label: "Music", icon: Music2, className: "bg-violet-600 text-white" },
  {
    label: "Messages",
    icon: MessageCircle,
    className: "bg-green-500 text-white",
  },
  { label: "Maps", icon: MapPinned, className: "bg-emerald-500 text-white" },
  { label: "Chrome", icon: Globe2, className: "bg-white text-blue-600" },
  { label: "Files", icon: FileJson, className: "bg-amber-500 text-white" },
  { label: "Home", icon: Home, className: "bg-cyan-500 text-white" },
  {
    label: "Settings",
    icon: Settings,
    className: "bg-stone-200 text-stone-800",
  },
  { label: "Search", icon: Search, className: "bg-blue-600 text-white" },
];

export const faviconAssetGroupDefinitions: FaviconAssetGroupDefinition[] = [
  {
    key: "primary",
    title: "Primary browser icon",
    description: "Declared in HTML and best suited for modern browser tabs.",
    className: "border-emerald-200 bg-emerald-50",
    matches: (asset) =>
      asset.kind === "favicon" && faviconFormatRank(asset) === 0,
  },
  {
    key: "legacy",
    title: "Legacy browser fallback",
    description: "ICO is mostly for old browsers and conservative fallbacks.",
    className: "border-stone-200 bg-stone-50",
    matches: (asset) =>
      asset.kind === "favicon" && faviconFormatRank(asset) === 1,
  },
  {
    key: "png",
    title: "Small PNG favicons",
    description:
      "Raster icons sized for browser tabs and classic favicon surfaces.",
    className: "border-sky-200 bg-sky-50",
    matches: (asset) =>
      asset.kind === "favicon" &&
      faviconFormatRank(asset) === 2 &&
      isImageAsset(asset) &&
      isSmallFaviconAsset(asset),
  },
  {
    key: "large",
    title: "Large app/search icons",
    description:
      "Declared through rel=icon, but better suited for Android, install or search surfaces than browser tabs.",
    className: "border-blue-200 bg-blue-50",
    matches: (asset) =>
      asset.kind === "favicon" &&
      faviconFormatRank(asset) === 2 &&
      isImageAsset(asset) &&
      !isSmallFaviconAsset(asset),
  },
  {
    key: "fallback",
    title: "Auto-checked default paths",
    description:
      "Common fallback URLs checked when browsers request default favicon paths.",
    className: "border-amber-200 bg-amber-50",
    matches: (asset) => asset.kind === "default-favicon",
  },
  {
    key: "issues",
    title: "Needs attention",
    description:
      "URLs that did not return an image and should not be relied on.",
    className: "border-red-200 bg-red-50",
    matches: (asset) => !isImageAsset(asset),
  },
];

export function findAsset(
  assets: PreviewAsset[],
  kinds: string[],
): PreviewAsset | null {
  return assets.find((asset) => kinds.includes(asset.kind ?? "")) ?? null;
}

export function findIconVariant(
  assets: PreviewAsset[],
  scheme: "light" | "dark",
): PreviewAsset | null {
  return (
    assets.find(
      (asset) =>
        ["favicon", "default-favicon"].includes(asset.kind ?? "") &&
        asset.declaredMedia
          ?.toLowerCase()
          .includes(`prefers-color-scheme: ${scheme}`),
    ) ?? null
  );
}

export function findManifestIcon(
  icons: PreviewAsset[],
  preferredSizes: string[],
): PreviewAsset | null {
  return (
    icons.find((icon) =>
      preferredSizes.some((size) => formatSizes(icon.sizes)?.includes(size)),
    ) ??
    icons.find((icon) => Boolean(icon.resolvedUrl)) ??
    null
  );
}

export function compareFaviconAssets(
  left: PreviewAsset,
  right: PreviewAsset,
): number {
  return (
    faviconFormatRank(left) - faviconFormatRank(right) ||
    faviconSizeRank(right) - faviconSizeRank(left) ||
    (left.declaredMedia ?? "").localeCompare(right.declaredMedia ?? "") ||
    (left.resolvedUrl ?? "").localeCompare(right.resolvedUrl ?? "")
  );
}

export function faviconFormatRank(asset: PreviewAsset): number {
  const type = asset.actualType?.toLowerCase() ?? "";
  const url = asset.resolvedUrl?.toLowerCase() ?? "";

  if (type.includes("svg") || url.endsWith(".svg")) {
    return 0;
  }

  if (
    type.includes("x-icon") ||
    type.includes("icon") ||
    url.endsWith(".ico")
  ) {
    return 1;
  }

  return 2;
}

export function isImageAsset(asset: PreviewAsset): boolean {
  if (asset.ok === false) {
    return false;
  }

  if (!asset.actualType) {
    return true;
  }

  return asset.actualType.includes("image");
}

export function faviconSizeRank(asset: PreviewAsset): number {
  if (asset.width && asset.height) {
    return Math.max(asset.width, asset.height);
  }

  const sizeText = asset.declaredSizes ?? formatSizes(asset.sizes) ?? "";
  const matches = [...sizeText.matchAll(/(\d+)\s*x\s*(\d+)/gi)];

  return matches.reduce((maxSize, match) => {
    const width = Number(match[1]);
    const height = Number(match[2]);

    return Math.max(maxSize, width, height);
  }, 0);
}

export function isSmallFaviconAsset(asset: PreviewAsset): boolean {
  const size = faviconSizeRank(asset);

  return size > 0 && size <= 64;
}

export function faviconRole(asset: PreviewAsset): string {
  if (!isImageAsset(asset)) {
    return "Not an image";
  }

  if (asset.kind === "default-favicon") {
    return "Default path fallback";
  }

  if (faviconFormatRank(asset) === 0) {
    return "Modern scalable tab icon";
  }

  if (faviconFormatRank(asset) === 1) {
    if (Array.isArray(asset.sizes) && asset.sizes.length > 1) {
      return "Multi-size ICO fallback";
    }

    return "Legacy ICO fallback";
  }

  if (!isSmallFaviconAsset(asset)) {
    return "Large app/search icon";
  }

  return "Declared raster size";
}

export function faviconSourceLabel(asset: PreviewAsset): string {
  if (asset.source === "default-path" || asset.kind === "default-favicon") {
    return "default path";
  }

  if (asset.rel) {
    return `<link rel="${asset.rel}">`;
  }

  return "HTML";
}

export function imageUrl(
  asset: PreviewAsset | null | undefined,
): string | null {
  if (!asset?.resolvedUrl) {
    return null;
  }

  if (asset.ok === false) {
    return null;
  }

  if (asset.actualType && !asset.actualType.includes("image")) {
    return null;
  }

  return asset.resolvedUrl;
}

export function assetMeta(asset: PreviewAsset | null | undefined): string {
  if (!asset) {
    return "Not declared";
  }

  const detectedSizes =
    Array.isArray(asset.sizes) && asset.sizes.length > 1
      ? formatSizes(asset.sizes)
      : null;
  const size =
    detectedSizes ??
    (asset.width && asset.height
      ? `${asset.width}x${asset.height}`
      : (asset.declaredSizes ?? formatSizes(asset.sizes)));
  const format = asset.actualType?.replace("image/", "") ?? null;

  return [size, format].filter(Boolean).join(" / ") || "Detected";
}

export function formatSizes(
  sizes: PreviewAsset["sizes"] | string | null | undefined,
): string | null {
  if (!sizes) {
    return null;
  }

  if (typeof sizes === "string") {
    return sizes;
  }

  return sizes.map((size) => `${size.width}x${size.height}`).join(", ");
}

export function hostLabel(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "website";
  }
}
