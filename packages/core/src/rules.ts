export const RULE_IDS = {
  pageReachable: "page.reachable",
  pageHttps: "page.https",
  pageTitle: "page.title",
  pageDescription: "page.description",
  faviconDeclared: "favicon.declared",
  faviconReachable: "favicon.reachable",
  appleTouchIcon: "apple.touch-icon",
  manifestDeclared: "manifest.declared",
  manifestValid: "manifest.valid-json",
  pwaIcon192: "pwa.icon-192",
  pwaIcon512: "pwa.icon-512",
  pwaMaskableIcon: "pwa.maskable-icon",
  openGraphImage: "social.og-image",
  twitterCard: "twitter.card"
} as const;

export type RuleId = (typeof RULE_IDS)[keyof typeof RULE_IDS];
