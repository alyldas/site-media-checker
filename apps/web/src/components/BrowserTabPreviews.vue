<script setup lang="ts">
import { Monitor } from "lucide-vue-next";
import { assetMeta, imageUrl, type PreviewAsset } from "../lib/preview";

const props = defineProps<{
  pageTitle: string;
  faviconAsset: PreviewAsset | null;
  lightIconAsset: PreviewAsset | null;
  darkIconAsset: PreviewAsset | null;
  fallbackText: string;
}>();

type BrowserPreview = {
  key: "chrome" | "safari" | "firefox";
  label: string;
  shotClass: string;
  barClass: string;
  activeClass: string;
  safari: boolean;
};

type BrowserTheme = {
  key: "light" | "dark";
  dark: boolean;
  dotClasses: string[];
  fallbackClass: string;
};

const browsers: BrowserPreview[] = [
  {
    key: "chrome",
    label: "Chrome",
    shotClass: "chrome-shot",
    barClass: "chrome-tabbar",
    activeClass: "chrome-active-tab",
    safari: false,
  },
  {
    key: "safari",
    label: "Safari",
    shotClass: "safari-shot",
    barClass: "safari-topbar",
    activeClass: "safari-address",
    safari: true,
  },
  {
    key: "firefox",
    label: "Firefox",
    shotClass: "firefox-shot",
    barClass: "firefox-tabbar",
    activeClass: "firefox-active-tab",
    safari: false,
  },
];

const themes: BrowserTheme[] = [
  {
    key: "light",
    dark: false,
    dotClasses: ["bg-red-400", "bg-amber-400", "bg-emerald-400"],
    fallbackClass: "text-emerald-800",
  },
  {
    key: "dark",
    dark: true,
    dotClasses: ["bg-red-500", "bg-amber-500", "bg-emerald-500"],
    fallbackClass: "text-stone-300",
  },
];

function themeIconAsset(theme: BrowserTheme): PreviewAsset | null {
  return (
    (theme.dark ? props.darkIconAsset : props.lightIconAsset) ??
    props.faviconAsset
  );
}
</script>

<template>
  <article
    class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
    :aria-label="`Browser tab previews in light and dark browser themes for ${pageTitle}`"
  >
    <div class="min-w-0">
      <p
        class="flex items-center gap-1.5 text-sm font-semibold text-emerald-800"
      >
        <Monitor class="size-4 shrink-0" aria-hidden="true" />
        <span>Browser tab</span>
      </p>
      <p class="text-anywhere mt-1 text-sm text-stone-700">
        {{ assetMeta(faviconAsset) }}
      </p>
    </div>

    <div class="mt-4 grid min-w-0 gap-3 lg:grid-cols-3">
      <div
        v-for="browser in browsers"
        :key="browser.key"
        class="grid min-w-0 gap-3 rounded-md border border-emerald-200 bg-white p-3"
      >
        <p class="text-xs font-semibold uppercase text-emerald-800">
          {{ browser.label }}
        </p>
        <div
          v-for="theme in themes"
          :key="`${browser.key}-${theme.key}`"
          class="browser-shot"
          :class="[browser.shotClass, { 'is-dark': theme.dark }]"
        >
          <div :class="browser.barClass">
            <div class="mac-lights" aria-hidden="true">
              <span
                v-for="dotClass in theme.dotClasses"
                :key="dotClass"
                class="mac-light"
                :class="dotClass"
              ></span>
            </div>
            <div :class="browser.activeClass">
              <span
                v-if="browser.safari"
                class="browser-close safari-tab-close"
                aria-hidden="true"
                >×</span
              >
              <img
                v-if="imageUrl(themeIconAsset(theme))"
                :src="imageUrl(themeIconAsset(theme)) ?? undefined"
                alt=""
                class="browser-favicon"
              />
              <span
                v-else
                class="browser-fallback-icon"
                :class="theme.fallbackClass"
                aria-hidden="true"
                >{{ fallbackText }}</span
              >
              <span
                :class="
                  browser.safari ? 'browser-host-text' : 'browser-title-text'
                "
                class="text-xs font-medium"
              >
                {{ pageTitle }}
              </span>
              <span
                v-if="!browser.safari"
                class="browser-close"
                aria-hidden="true"
                >×</span
              >
            </div>
            <span
              :class="browser.safari ? 'safari-round-button' : 'browser-plus'"
              aria-hidden="true"
              >+</span
            >
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
