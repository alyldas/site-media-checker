<script setup lang="ts">
import {
  Apple,
  MessageCircle,
  Moon,
  Music2,
  Phone,
  Search,
  Smartphone,
  Sun,
  type LucideIcon,
} from "lucide-vue-next";
import {
  androidSampleApps,
  assetMeta,
  imageUrl,
  iosSampleApps,
  type HomeScreenApp,
  type PreviewAsset,
} from "../lib/preview";

const props = defineProps<{
  asset: PreviewAsset | null;
  fallbackText: string;
  pageTitle: string;
  platform: "ios" | "android";
}>();

const isIos = props.platform === "ios";
const sampleApps: HomeScreenApp[] = isIos ? iosSampleApps : androidSampleApps;
const sectionClasses = isIos
  ? "rounded-lg border border-rose-200 bg-rose-50 p-4"
  : "rounded-lg border border-violet-200 bg-violet-50 p-4";
const titleClasses = isIos
  ? "flex items-center gap-1.5 text-sm font-semibold text-rose-800"
  : "flex items-center gap-1.5 text-sm font-semibold text-violet-800";
const title = isIos ? "iOS home screen" : "Android home screen";
const label = isIos
  ? `iOS home screen light and dark preview for ${props.pageTitle}`
  : `Android PWA home screen light and dark preview for ${props.pageTitle}`;

type PhoneTheme = {
  key: "light" | "dark";
  label: string;
  icon: LucideIcon;
};

const themes: PhoneTheme[] = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
];

function screenClasses(theme: PhoneTheme): string {
  if (theme.key === "light") {
    return isIos
      ? "bg-gradient-to-br from-sky-200 via-rose-100 to-amber-100"
      : "bg-gradient-to-br from-cyan-100 via-white to-lime-100";
  }

  return isIos
    ? "bg-gradient-to-br from-stone-950 via-slate-900 to-indigo-950"
    : "bg-gradient-to-br from-zinc-950 via-slate-900 to-violet-950";
}

function themeLabelClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-700" : "text-stone-300";
}

function statusClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-900" : "text-stone-100";
}

function appLabelClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-800" : "text-stone-100";
}

function sampleLabelClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-700" : "text-stone-200";
}

function widgetClasses(theme: PhoneTheme): string {
  return theme.key === "light"
    ? "bg-white/60 text-stone-800 backdrop-blur"
    : "bg-white/10 text-stone-100 backdrop-blur";
}

function androidDateClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-900" : "text-stone-100";
}

function androidWeatherClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-600" : "text-stone-400";
}

function androidWeather(theme: PhoneTheme): string {
  return theme.key === "light" ? "24° · Sunny" : "24° · Clear";
}

function dockClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "bg-white/45" : "bg-white/10";
}

function searchBarClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "bg-white" : "bg-stone-900";
}

function searchIconClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-blue-600" : "text-blue-400";
}

function searchTextClasses(theme: PhoneTheme): string {
  return theme.key === "light" ? "text-stone-500" : "text-stone-400";
}
</script>

<template>
  <article class="home-screen-card" :class="sectionClasses" :aria-label="label">
    <div class="min-w-0">
      <p :class="titleClasses">
        <Apple v-if="isIos" class="size-4 shrink-0" aria-hidden="true" />
        <Smartphone v-else class="size-4 shrink-0" aria-hidden="true" />
        <span>{{ title }}</span>
      </p>
      <p class="text-anywhere mt-1 text-sm text-stone-700">
        {{ assetMeta(asset) }}
      </p>
    </div>

    <div class="home-screen-pair mt-4">
      <div
        v-for="theme in themes"
        :key="theme.key"
        class="phone-frame"
        :class="isIos ? 'phone-frame-ios' : 'phone-frame-android'"
      >
        <div class="phone-screen" :class="screenClasses(theme)">
          <div
            class="phone-status"
            :class="[statusClasses(theme), { 'phone-status-android': !isIos }]"
          >
            <span>9:41</span>
            <span v-if="isIos" class="phone-island" aria-hidden="true"></span>
            <span v-else class="phone-camera-cutout" aria-hidden="true"></span>
            <span class="phone-status-network">{{
              isIos ? "5G 100%" : "LTE 100%"
            }}</span>
          </div>
          <p
            class="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase"
            :class="themeLabelClasses(theme)"
          >
            <component :is="theme.icon" class="size-3.5" aria-hidden="true" />
            <span>{{ theme.label }}</span>
          </p>

          <div v-if="isIos" class="phone-widget" :class="widgetClasses(theme)">
            <p class="text-xs font-semibold">Monday, May 11</p>
            <p class="mt-1 text-2xl font-semibold leading-none">24°</p>
          </div>
          <div v-else class="mt-4">
            <p class="text-sm font-semibold" :class="androidDateClasses(theme)">
              Mon, May 11
            </p>
            <p class="mt-1 text-xs" :class="androidWeatherClasses(theme)">
              {{ androidWeather(theme) }}
            </p>
          </div>

          <div class="phone-app-grid">
            <div class="phone-app">
              <div class="phone-app-icon phone-primary-icon bg-white">
                <img
                  v-if="imageUrl(asset)"
                  :src="imageUrl(asset) ?? undefined"
                  alt=""
                  class="phone-primary-image"
                />
                <span
                  v-else
                  class="text-lg font-semibold"
                  :class="isIos ? 'text-rose-800' : 'text-violet-800'"
                  aria-hidden="true"
                  >{{ fallbackText }}</span
                >
              </div>
              <p class="phone-app-label" :class="appLabelClasses(theme)">
                {{ pageTitle }}
              </p>
            </div>
            <div
              v-for="app in sampleApps"
              :key="`${platform}-${theme.key}-${app.label}`"
              class="phone-app"
            >
              <div class="phone-app-icon" :class="app.className">
                <component :is="app.icon" class="size-6" aria-hidden="true" />
              </div>
              <p class="phone-app-label" :class="sampleLabelClasses(theme)">
                {{ app.label }}
              </p>
            </div>
          </div>

          <div v-if="isIos" class="ios-dock" :class="dockClasses(theme)">
            <div class="phone-app-icon bg-emerald-500 text-white">
              <Phone class="size-5" aria-hidden="true" />
            </div>
            <div class="phone-app-icon bg-sky-500 text-white">
              <MessageCircle class="size-5" aria-hidden="true" />
            </div>
            <div class="phone-app-icon bg-blue-500 text-white">
              <Search class="size-5" aria-hidden="true" />
            </div>
            <div class="phone-app-icon bg-rose-500 text-white">
              <Music2 class="size-5" aria-hidden="true" />
            </div>
          </div>
          <div
            v-else
            class="android-search-bar"
            :class="searchBarClasses(theme)"
          >
            <Search
              class="size-4 shrink-0"
              :class="searchIconClasses(theme)"
              aria-hidden="true"
            />
            <span
              class="min-w-0 flex-1 truncate text-xs"
              :class="searchTextClasses(theme)"
              >Search</span
            >
            <span
              class="size-4 rounded-full bg-blue-500"
              aria-hidden="true"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
