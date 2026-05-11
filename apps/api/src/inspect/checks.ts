import type {
  Check,
  CheckCategory,
} from "../../../../packages/core/src/types.ts";
import { RULE_IDS } from "../../../../packages/core/src/rules.ts";
import type { InspectedAsset } from "./inspect-asset.ts";
import type { ManifestInspection } from "./inspect-manifest.ts";
import type { ParsedHtmlMetadata } from "./parse-html.ts";

export function buildChecks(
  page: ParsedHtmlMetadata,
  assets: InspectedAsset[],
  manifest: ManifestInspection | null,
  status: number | null,
  isHttps = true,
): Check[] {
  const checks: Check[] = [];
  const faviconAssets = assets.filter((asset) =>
    asset.kind === "favicon" || asset.kind === "default-favicon"
  );
  const appleAssets = assets.filter((asset) =>
    asset.kind === "apple-touch-icon"
  );
  const ogImageAssets = assets.filter((asset) => asset.kind === "og-image");
  const twitterImageAssets = assets.filter((asset) =>
    asset.kind === "twitter-image"
  );
  const pageReachable = status !== null && status >= 200 && status < 300;

  checks.push(
    pageReachable
      ? ok(
        RULE_IDS.pageReachable,
        "Page reachable",
        "Page returned a 2xx response.",
        "page",
      )
      : errorCheck(
        RULE_IDS.pageReachable,
        "Page reachable",
        status === null
          ? "Page could not be fetched."
          : `Page returned HTTP ${status}.`,
        "page",
      ),
  );
  checks.push(
    isHttps
      ? ok(
        RULE_IDS.pageHttps,
        "HTTPS",
        "Page was fetched over HTTPS.",
        "security",
      )
      : warning(
        RULE_IDS.pageHttps,
        "HTTPS",
        "Page was fetched over insecure HTTP.",
        "security",
      ),
  );
  checks.push(
    page.title
      ? ok(RULE_IDS.pageTitle, "Page title", "Page has a title.", "page")
      : warning(
        RULE_IDS.pageTitle,
        "Page title",
        "Page is missing a title.",
        "page",
      ),
  );
  checks.push(
    page.description
      ? ok(
        RULE_IDS.pageDescription,
        "Meta description",
        "Page has a meta description.",
        "page",
      )
      : warning(
        RULE_IDS.pageDescription,
        "Meta description",
        "Page is missing a meta description.",
        "page",
      ),
  );
  checks.push(
    faviconAssets.some((asset) => asset.ok)
      ? ok(
        RULE_IDS.faviconReachable,
        "Favicon",
        "At least one favicon is reachable.",
        "favicon",
      )
      : warning(
        RULE_IDS.faviconReachable,
        "Favicon",
        "No reachable favicon was detected.",
        "favicon",
      ),
  );
  checks.push(
    appleAssets.some((asset) => asset.ok)
      ? ok(
        RULE_IDS.appleTouchIcon,
        "Apple Touch Icon",
        "Apple Touch Icon is reachable.",
        "apple",
      )
      : warning(
        RULE_IDS.appleTouchIcon,
        "Apple Touch Icon",
        "Apple Touch Icon is missing or unreachable.",
        "apple",
      ),
  );
  checks.push(
    manifest?.ok && manifest.validJson
      ? ok(
        RULE_IDS.manifestValid,
        "Web App Manifest",
        "Manifest JSON is valid.",
        "manifest",
      )
      : warning(
        RULE_IDS.manifestValid,
        "Web App Manifest",
        "No valid manifest was detected.",
        "manifest",
      ),
  );

  if (manifest) {
    checks.push(
      manifest.capabilities.has192Icon
        ? ok(
          RULE_IDS.pwaIcon192,
          "PWA 192 icon",
          "Manifest declares a 192x192 icon.",
          "pwa",
        )
        : warning(
          RULE_IDS.pwaIcon192,
          "PWA 192 icon",
          "Manifest does not declare a 192x192 icon.",
          "pwa",
        ),
    );
    checks.push(
      manifest.capabilities.has512Icon
        ? ok(
          RULE_IDS.pwaIcon512,
          "PWA 512 icon",
          "Manifest declares a 512x512 icon.",
          "pwa",
        )
        : warning(
          RULE_IDS.pwaIcon512,
          "PWA 512 icon",
          "Manifest does not declare a 512x512 icon.",
          "pwa",
        ),
    );
    checks.push(
      manifest.capabilities.hasMaskableIcon
        ? ok(
          RULE_IDS.pwaMaskableIcon,
          "Maskable icon",
          "Manifest declares a maskable icon.",
          "pwa",
        )
        : warning(
          RULE_IDS.pwaMaskableIcon,
          "Maskable icon",
          "Manifest does not declare a maskable icon.",
          "pwa",
        ),
    );
  }

  checks.push(
    page.openGraph["og:image"] || page.openGraph["og:image:url"] ||
      page.openGraph["og:image:secure_url"]
      ? ok(
        RULE_IDS.openGraphImage,
        "Open Graph image",
        "Open Graph image is declared.",
        "social",
      )
      : warning(
        RULE_IDS.openGraphImage,
        "Open Graph image",
        "Open Graph image is missing.",
        "social",
      ),
  );
  checks.push(
    ogImageAssets.some((asset) => asset.ok)
      ? ok(
        RULE_IDS.openGraphImageReachable,
        "Open Graph image reachable",
        "Open Graph image is reachable.",
        "social",
      )
      : page.openGraph["og:image"] || page.openGraph["og:image:url"] ||
          page.openGraph["og:image:secure_url"]
      ? warning(
        RULE_IDS.openGraphImageReachable,
        "Open Graph image reachable",
        "Open Graph image is declared but was not fetched as a valid image.",
        "social",
      )
      : info(
        RULE_IDS.openGraphImageReachable,
        "Open Graph image reachable",
        "No reachable Open Graph image was inspected.",
        "social",
      ),
  );
  checks.push(
    page.twitter["twitter:card"]
      ? ok(
        RULE_IDS.twitterCard,
        "Twitter/X Card",
        "Twitter/X Card is declared.",
        "twitter",
      )
      : warning(
        RULE_IDS.twitterCard,
        "Twitter/X Card",
        "Twitter/X Card is missing.",
        "twitter",
      ),
  );
  if (page.twitter["twitter:image"]) {
    checks.push(
      twitterImageAssets.some((asset) => asset.ok)
        ? ok(
          RULE_IDS.twitterImageReachable,
          "Twitter/X image reachable",
          "Twitter/X image was fetched as a valid image.",
          "twitter",
        )
        : warning(
          RULE_IDS.twitterImageReachable,
          "Twitter/X image reachable",
          "Twitter/X image is declared but was not fetched as a valid image.",
          "twitter",
        ),
    );
  }

  for (const asset of assets) {
    if (!asset.ok && asset.source !== "default-path") {
      checks.push(
        errorCheck(
          `${asset.kind}.asset.${asset.id}`,
          "Declared asset unreachable",
          "A declared asset could not be fetched as a valid image.",
          categoryForAssetKind(asset.kind),
          asset.resolvedUrl,
        ),
      );
    }
  }

  return checks;
}

function ok(
  id: string,
  title: string,
  message: string,
  category: CheckCategory,
): Check {
  return { id, title, severity: "ok", message, category };
}

function info(
  id: string,
  title: string,
  message: string,
  category: CheckCategory,
): Check {
  return { id, title, severity: "info", message, category };
}

function warning(
  id: string,
  title: string,
  message: string,
  category: CheckCategory,
): Check {
  return { id, title, severity: "warning", message, category };
}

function errorCheck(
  id: string,
  title: string,
  message: string,
  category: CheckCategory,
  target?: string,
): Check {
  return { id, title, severity: "error", message, category, target };
}

function categoryForAssetKind(kind: InspectedAsset["kind"]): CheckCategory {
  switch (kind) {
    case "apple-touch-icon":
      return "apple";
    case "manifest-icon":
      return "manifest";
    case "og-image":
      return "social";
    case "twitter-image":
      return "twitter";
    case "favicon":
    case "default-favicon":
      return "favicon";
    default:
      return "page";
  }
}
