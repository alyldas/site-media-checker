export const RULE_IDS = {
  pageReachable: "page.reachable",
  pageHttps: "page.https",
  pageTitle: "page.title",
  pageDescription: "page.description",
  faviconReachable: "favicon.reachable",
  appleTouchIcon: "apple.touch-icon",
  manifestValid: "manifest.valid-json",
  pwaIcon192: "pwa.icon-192",
  pwaIcon512: "pwa.icon-512",
  pwaMaskableIcon: "pwa.maskable-icon",
  openGraphImage: "social.og-image",
  openGraphImageReachable: "social.og-image.reachable",
  twitterCard: "twitter.card",
  twitterImageReachable: "twitter.image.reachable",
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];
