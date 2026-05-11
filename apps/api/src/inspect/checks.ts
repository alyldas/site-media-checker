import type {
  Check,
  CheckCategory,
} from "../../../../packages/core/src/types.ts";
import type { InspectedAsset } from "./inspect-asset.ts";
import type { ManifestInspection } from "./inspect-manifest.ts";
import type { ParsedHtmlMetadata } from "./parse-html.ts";

export function buildChecks(
  page: ParsedHtmlMetadata,
  assets: InspectedAsset[],
  manifest: ManifestInspection | null,
): Check[] {
  const checks: Check[] = [];
  const faviconAssets = assets.filter((asset) =>
    asset.kind === "favicon" || asset.kind === "default-favicon"
  );
  const appleAssets = assets.filter((asset) =>
    asset.kind === "apple-touch-icon"
  );
  const ogImageAssets = assets.filter((asset) => asset.kind === "og-image");

  checks.push(
    page.title
      ? ok("page.title", "Page title", "Page has a title.", "page")
      : warning("page.title", "Page title", "Page is missing a title.", "page"),
  );
  checks.push(
    page.description
      ? ok(
        "page.description",
        "Meta description",
        "Page has a meta description.",
        "page",
      )
      : warning(
        "page.description",
        "Meta description",
        "Page is missing a meta description.",
        "page",
      ),
  );
  checks.push(
    faviconAssets.some((asset) => asset.ok)
      ? ok(
        "favicon.reachable",
        "Favicon",
        "At least one favicon is reachable.",
        "favicon",
      )
      : warning(
        "favicon.reachable",
        "Favicon",
        "No reachable favicon was detected.",
        "favicon",
      ),
  );
  checks.push(
    appleAssets.some((asset) => asset.ok)
      ? ok(
        "apple.touch-icon",
        "Apple Touch Icon",
        "Apple Touch Icon is reachable.",
        "apple",
      )
      : warning(
        "apple.touch-icon",
        "Apple Touch Icon",
        "Apple Touch Icon is missing or unreachable.",
        "apple",
      ),
  );
  checks.push(
    manifest?.validJson
      ? ok(
        "manifest.valid-json",
        "Web App Manifest",
        "Manifest JSON is valid.",
        "manifest",
      )
      : warning(
        "manifest.valid-json",
        "Web App Manifest",
        "No valid manifest was detected.",
        "manifest",
      ),
  );

  if (manifest) {
    checks.push(
      manifest.capabilities.has192Icon
        ? ok(
          "pwa.icon-192",
          "PWA 192 icon",
          "Manifest declares a 192x192 icon.",
          "pwa",
        )
        : warning(
          "pwa.icon-192",
          "PWA 192 icon",
          "Manifest does not declare a 192x192 icon.",
          "pwa",
        ),
    );
    checks.push(
      manifest.capabilities.has512Icon
        ? ok(
          "pwa.icon-512",
          "PWA 512 icon",
          "Manifest declares a 512x512 icon.",
          "pwa",
        )
        : warning(
          "pwa.icon-512",
          "PWA 512 icon",
          "Manifest does not declare a 512x512 icon.",
          "pwa",
        ),
    );
    checks.push(
      manifest.capabilities.hasMaskableIcon
        ? ok(
          "pwa.maskable-icon",
          "Maskable icon",
          "Manifest declares a maskable icon.",
          "pwa",
        )
        : warning(
          "pwa.maskable-icon",
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
        "social.og-image",
        "Open Graph image",
        "Open Graph image is declared.",
        "social",
      )
      : warning(
        "social.og-image",
        "Open Graph image",
        "Open Graph image is missing.",
        "social",
      ),
  );
  checks.push(
    ogImageAssets.some((asset) => asset.ok)
      ? ok(
        "social.og-image.reachable",
        "Open Graph image reachable",
        "Open Graph image is reachable.",
        "social",
      )
      : info(
        "social.og-image.reachable",
        "Open Graph image reachable",
        "No reachable Open Graph image was inspected.",
        "social",
      ),
  );
  checks.push(
    page.twitter["twitter:card"]
      ? ok(
        "twitter.card",
        "Twitter/X Card",
        "Twitter/X Card is declared.",
        "twitter",
      )
      : warning(
        "twitter.card",
        "Twitter/X Card",
        "Twitter/X Card is missing.",
        "twitter",
      ),
  );

  for (const asset of assets) {
    if (!asset.ok && asset.source === "html-link") {
      checks.push(
        errorCheck(
          `${asset.kind}.asset.${asset.id}`,
          "Declared asset unreachable",
          "A declared asset could not be fetched.",
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
  target: string,
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
