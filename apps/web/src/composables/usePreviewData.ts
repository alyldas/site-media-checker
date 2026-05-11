import { computed, type Ref } from "vue";
import {
  assetMeta,
  compareFaviconAssets,
  faviconAssetGroupDefinitions,
  findAsset as findPreviewAsset,
  findIconVariant as findPreviewIconVariant,
  findManifestIcon as findPreviewManifestIcon,
  hostLabel,
  isImageAsset,
  type FaviconAssetGroup,
  type PreviewAsset,
} from "../lib/preview";
import type { InspectReport } from "@site-media-checker/core";

export type BrowserFaviconSummary = {
  total: number;
  groups: number;
  sizes: string;
  issues: number;
};

export function usePreviewData(
  report: Ref<InspectReport | null>,
  inputUrl: Ref<string>,
) {
  const pageTitle = computed(
    () =>
      report.value?.page?.title ??
      report.value?.manifest?.fields.name ??
      report.value?.manifest?.fields.shortName ??
      hostLabel(
        report.value?.finalUrl ?? report.value?.normalizedUrl ?? inputUrl.value,
      ),
  );

  const pageDescription = computed(
    () =>
      report.value?.page?.description ??
      report.value?.manifest?.fields.description ??
      "No description detected.",
  );

  const pageHost = computed(() =>
    hostLabel(
      report.value?.finalUrl ?? report.value?.normalizedUrl ?? inputUrl.value,
    ),
  );

  const faviconAsset = computed(() =>
    findAsset(["favicon", "default-favicon"]),
  );

  const browserFaviconAssets = computed(() =>
    (
      report.value?.icons.filter((asset) =>
        ["favicon", "default-favicon"].includes(asset.kind),
      ) ?? []
    )
      .slice()
      .sort(compareFaviconAssets),
  );

  const browserFaviconGroups = computed<FaviconAssetGroup[]>(() => {
    return faviconAssetGroupDefinitions
      .map(({ matches, ...group }) => ({
        ...group,
        assets: browserFaviconAssets.value.filter(matches),
      }))
      .filter((group) => group.assets.length > 0);
  });

  const browserFaviconSummary = computed<BrowserFaviconSummary>(() => {
    const sizes = new Set(
      browserFaviconAssets.value
        .filter(isImageAsset)
        .map((asset) => assetMeta(asset))
        .filter(Boolean),
    );

    return {
      total: browserFaviconAssets.value.length,
      groups: browserFaviconGroups.value.length,
      sizes: Array.from(sizes).slice(0, 6).join(", "),
      issues: browserFaviconAssets.value.filter((asset) => !isImageAsset(asset))
        .length,
    };
  });

  const lightIconAsset = computed(() => findIconVariant("light"));
  const darkIconAsset = computed(() => findIconVariant("dark"));

  const appleIconAsset = computed(
    () =>
      findAsset(["apple-touch-icon"]) ??
      findManifestIcon(["180x180", "167x167", "152x152"]),
  );

  const pwaIconAsset = computed(
    () =>
      findAsset(["manifest-icon"]) ?? findManifestIcon(["512x512", "192x192"]),
  );

  const ogImageAsset = computed(
    () => report.value?.social.openGraph.imageAsset ?? findAsset(["og-image"]),
  );

  const twitterImageAsset = computed(
    () =>
      report.value?.social.twitter.imageAsset ??
      findAsset(["twitter-image"]) ??
      ogImageAsset.value,
  );

  const ogTitle = computed(
    () => report.value?.social.openGraph.title ?? pageTitle.value,
  );
  const ogDescription = computed(
    () => report.value?.social.openGraph.description ?? pageDescription.value,
  );
  const twitterTitle = computed(
    () => report.value?.social.twitter.title ?? ogTitle.value,
  );
  const twitterDescription = computed(
    () => report.value?.social.twitter.description ?? ogDescription.value,
  );

  function findAsset(kinds: string[]): PreviewAsset | null {
    return findPreviewAsset(report.value?.icons ?? [], kinds);
  }

  function findIconVariant(scheme: "light" | "dark"): PreviewAsset | null {
    return findPreviewIconVariant(report.value?.icons ?? [], scheme);
  }

  function findManifestIcon(preferredSizes: string[]): PreviewAsset | null {
    return findPreviewManifestIcon(
      report.value?.manifest?.icons ?? [],
      preferredSizes,
    );
  }

  const previewInitial = computed(() =>
    pageHost.value.slice(0, 1).toUpperCase(),
  );

  return {
    appleIconAsset,
    browserFaviconGroups,
    browserFaviconSummary,
    darkIconAsset,
    faviconAsset,
    lightIconAsset,
    ogDescription,
    ogImageAsset,
    ogTitle,
    pageDescription,
    pageHost,
    pageTitle,
    previewInitial,
    pwaIconAsset,
    twitterDescription,
    twitterImageAsset,
    twitterTitle,
  };
}
