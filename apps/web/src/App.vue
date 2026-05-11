<script setup lang="ts">
import { computed, ref } from "vue";
import {
  AlertCircle,
  Apple,
  CircleCheck,
  CircleX,
  Database,
  Eye,
  FileJson,
  Gauge,
  Globe2,
  Info,
  LoaderCircle,
  MessageSquareText,
  Monitor,
  Search,
  SearchCheck,
  Share2,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  type LucideIcon,
} from "lucide-vue-next";
import { inspectUrl } from "./api/client";
import BrowserTabPreviews from "./components/BrowserTabPreviews.vue";
import FaviconAssets from "./components/FaviconAssets.vue";
import HomeScreenPreview from "./components/HomeScreenPreview.vue";
import SearchResultPreview from "./components/SearchResultPreview.vue";
import SocialPreviews from "./components/SocialPreviews.vue";
import { usePreviewData } from "./composables/usePreviewData";
import type { InspectReport } from "@site-media-checker/core";

const capabilityBadges: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Browser favicon", icon: Monitor },
  { label: "Google/Search favicon", icon: SearchCheck },
  { label: "Apple Touch Icon", icon: Apple },
  { label: "Web App Manifest", icon: FileJson },
  { label: "PWA icons", icon: Smartphone },
  { label: "Maskable icon", icon: ShieldCheck },
  { label: "Open Graph", icon: Share2 },
  { label: "Twitter/X Card", icon: MessageSquareText },
];

const inputUrl = ref("");
const report = ref<InspectReport | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

const {
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
} = usePreviewData(report, inputUrl);

const counts = computed(() => {
  const checks = report.value?.checks ?? [];

  return {
    passed: checks.filter((check) => check.severity === "ok").length,
    warnings: checks.filter((check) => check.severity === "warning").length,
    errors: checks.filter((check) => check.severity === "error").length,
    info: checks.filter((check) => check.severity === "info").length,
  };
});

const statusMetrics = computed(() => [
  {
    label: "Passed",
    value: counts.value.passed,
    icon: CircleCheck,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    label: "Warnings",
    value: counts.value.warnings,
    icon: TriangleAlert,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  {
    label: "Errors",
    value: counts.value.errors,
    icon: CircleX,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  {
    label: "Info",
    value: counts.value.info,
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
]);

function severityClass(severity: string) {
  switch (severity) {
    case "ok":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "info":
      return "border-sky-200 bg-sky-50 text-sky-800";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

function severityIcon(severity: string): LucideIcon {
  switch (severity) {
    case "ok":
      return CircleCheck;
    case "warning":
      return TriangleAlert;
    case "error":
      return CircleX;
    case "info":
      return Info;
    default:
      return AlertCircle;
  }
}

async function submitInspection() {
  errorMessage.value = null;
  isLoading.value = true;

  try {
    report.value = await inspectUrl(inputUrl.value);
  } catch (error) {
    report.value = null;
    errorMessage.value =
      error instanceof Error ? error.message : "Inspection failed.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <a class="skip-link" href="#content">Skip to content</a>
  <main id="content" class="min-h-screen" tabindex="-1">
    <section
      class="border-b border-stone-200 bg-[#f7f8f3]"
      aria-labelledby="page-title"
    >
      <div
        class="mx-auto grid min-h-[600px] w-full max-w-screen-xl content-center gap-8 px-5 py-10 sm:min-h-[660px] sm:gap-10 sm:px-8 xl:min-h-[700px]"
      >
        <div class="min-w-0">
          <p
            class="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700"
          >
            Site Media Checker
          </p>
          <h1
            id="page-title"
            class="w-full text-4xl font-semibold leading-tight text-stone-950 sm:text-6xl xl:text-5xl 2xl:text-6xl"
          >
            Check website icons, app metadata and social previews.
          </h1>
          <p
            class="mt-5 w-full text-base leading-7 text-stone-700 sm:text-lg sm:leading-8"
          >
            Validate favicons, Apple Touch Icon, Web App Manifest, PWA icons,
            maskable icons, Open Graph and Twitter/X Card metadata from one URL.
          </p>
        </div>

        <form
          class="grid w-full grid-cols-1 gap-3 rounded-lg border border-stone-300 bg-white p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_9rem]"
          aria-label="Website inspection form"
          @submit.prevent="submitInspection"
        >
          <label id="url-label" class="sr-only" for="url">Website URL</label>
          <input
            id="url"
            v-model="inputUrl"
            class="min-h-12 min-w-0 rounded-md border border-stone-200 px-4 text-base outline-none transition focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-100"
            placeholder="Enter website URL"
            type="url"
            autocomplete="url"
            :aria-invalid="Boolean(errorMessage)"
            :aria-busy="isLoading"
            :aria-describedby="errorMessage ? 'url-help url-error' : 'url-help'"
            :aria-errormessage="errorMessage ? 'url-error' : undefined"
          />
          <p id="url-help" class="sr-only">
            Enter a public website URL to inspect media metadata.
          </p>
          <button
            class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-stone-950 px-5 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-400"
            type="submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
            :aria-label="
              isLoading
                ? 'Checking website media metadata'
                : 'Check website media metadata'
            "
          >
            <LoaderCircle
              v-if="isLoading"
              class="size-5 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <Search v-else class="size-5 shrink-0" aria-hidden="true" />
            <span class="whitespace-nowrap">Check</span>
          </button>
        </form>

        <ul
          class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Supported checks"
        >
          <li
            v-for="badge in capabilityBadges"
            :key="badge.label"
            class="flex min-h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium leading-5 text-stone-700"
          >
            <component
              :is="badge.icon"
              class="size-4 shrink-0 text-emerald-700"
              aria-hidden="true"
            />
            <span class="min-w-0">{{ badge.label }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="bg-white px-5 py-10 sm:px-8">
      <div class="mx-auto w-full max-w-screen-xl">
        <div
          v-if="errorMessage"
          id="url-error"
          role="alert"
          class="mb-6 grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900"
        >
          <AlertCircle class="mt-0.5 size-5" aria-hidden="true" />
          <p class="text-anywhere min-w-0">{{ errorMessage }}</p>
        </div>

        <div
          v-if="report"
          class="min-w-0 space-y-5"
          aria-live="polite"
          aria-atomic="false"
        >
          <section
            class="rounded-lg border border-stone-200 bg-stone-50 p-4 sm:p-5"
            aria-labelledby="score-title"
          >
            <div
              class="grid min-w-0 gap-4 xl:grid-cols-[10rem_minmax(0,1fr)] xl:items-center"
            >
              <div
                class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 lg:block"
              >
                <h2
                  id="score-title"
                  class="flex items-center gap-2 text-sm font-medium text-stone-500"
                >
                  <Gauge class="size-4 shrink-0" aria-hidden="true" />
                  <span>Score</span>
                </h2>
                <p
                  class="text-5xl font-semibold leading-none text-stone-950 xl:mt-2"
                  :aria-label="`Score ${report.score} out of 100`"
                >
                  {{ report.score }}
                </p>
              </div>
              <dl class="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4">
                <div
                  v-for="metric in statusMetrics"
                  :key="metric.label"
                  class="min-h-16 rounded-md border px-3 py-2"
                  :class="metric.className"
                >
                  <dt
                    class="flex items-center gap-1.5 text-xs font-semibold uppercase leading-5"
                  >
                    <component
                      :is="metric.icon"
                      class="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{{ metric.label }}</span>
                  </dt>
                  <dd class="text-2xl font-semibold leading-7">
                    {{ metric.value }}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <div class="min-w-0 space-y-5">
            <section
              class="rounded-lg border border-stone-200 p-5"
              aria-labelledby="overview-title"
            >
              <div
                class="grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-3"
              >
                <Globe2
                  class="mt-1 size-5 text-emerald-700"
                  aria-hidden="true"
                />
                <div class="min-w-0">
                  <h2
                    id="overview-title"
                    class="text-xl font-semibold text-stone-950"
                  >
                    Overview
                  </h2>
                  <p class="text-anywhere mt-1 text-stone-600">
                    {{ report.normalizedUrl }}
                  </p>
                </div>
              </div>
            </section>

            <section
              class="rounded-lg border border-stone-200 p-5"
              aria-labelledby="media-previews-title"
            >
              <div class="flex flex-wrap items-end justify-between gap-3">
                <div class="min-w-0">
                  <h2
                    id="media-previews-title"
                    class="flex items-center gap-2 text-xl font-semibold text-stone-950"
                  >
                    <Eye
                      class="size-5 shrink-0 text-emerald-700"
                      aria-hidden="true"
                    />
                    <span>Media Previews</span>
                  </h2>
                  <p class="text-anywhere mt-1 text-stone-600">
                    {{ pageHost }}
                  </p>
                </div>
              </div>

              <FaviconAssets
                :groups="browserFaviconGroups"
                :summary="browserFaviconSummary"
                :fallback-text="previewInitial"
              />

              <BrowserTabPreviews
                :page-title="pageTitle"
                :favicon-asset="faviconAsset"
                :light-icon-asset="lightIconAsset"
                :dark-icon-asset="darkIconAsset"
                :fallback-text="previewInitial"
              />

              <div class="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-2">
                <HomeScreenPreview
                  platform="ios"
                  :asset="appleIconAsset"
                  :fallback-text="previewInitial"
                  :page-title="pageTitle"
                />
                <HomeScreenPreview
                  platform="android"
                  :asset="pwaIconAsset"
                  :fallback-text="previewInitial"
                  :page-title="pageTitle"
                />
              </div>

              <SearchResultPreview
                :favicon-asset="faviconAsset"
                :fallback-text="previewInitial"
                :page-description="pageDescription"
                :page-host="pageHost"
                :page-title="pageTitle"
              />

              <SocialPreviews
                :card="report.social.twitter.card"
                :og-description="ogDescription"
                :og-image-asset="ogImageAsset"
                :og-title="ogTitle"
                :page-host="pageHost"
                :page-title="pageTitle"
                :twitter-description="twitterDescription"
                :twitter-image-asset="twitterImageAsset"
                :twitter-title="twitterTitle"
              />
            </section>

            <section
              class="rounded-lg border border-stone-200 p-5"
              aria-labelledby="checks-title"
            >
              <h2
                id="checks-title"
                class="flex items-center gap-2 text-xl font-semibold text-stone-950"
              >
                <SearchCheck
                  class="size-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <span>Checks</span>
              </h2>
              <ul class="mt-4 divide-y divide-stone-200">
                <li v-for="check in report.checks" :key="check.id" class="py-4">
                  <div
                    class="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-start sm:gap-3"
                  >
                    <span
                      class="inline-flex h-7 w-fit min-w-24 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-semibold uppercase leading-none sm:w-24"
                      :class="severityClass(check.severity)"
                      :aria-label="`Severity ${check.severity}`"
                    >
                      <component
                        :is="severityIcon(check.severity)"
                        class="size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {{ check.severity }}
                    </span>
                    <h3
                      class="text-anywhere min-w-0 font-semibold leading-6 text-stone-950"
                    >
                      {{ check.title }}
                    </h3>
                  </div>
                  <p class="text-anywhere mt-1 text-stone-700 sm:ml-[8.25rem]">
                    {{ check.message }}
                  </p>
                </li>
              </ul>
            </section>

            <details
              class="group min-w-0 rounded-lg border border-stone-200 bg-stone-50"
            >
              <summary
                class="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                <span
                  class="flex min-w-0 items-center gap-2 text-base font-semibold text-stone-950"
                >
                  <Database
                    class="size-5 shrink-0 text-emerald-700"
                    aria-hidden="true"
                  />
                  <span>Debug JSON</span>
                </span>
                <span
                  class="shrink-0 text-sm font-medium text-stone-500 group-open:hidden"
                  >Show JSON</span
                >
                <span
                  class="hidden shrink-0 text-sm font-medium text-stone-500 group-open:inline"
                  >Hide JSON</span
                >
              </summary>
              <div class="border-t border-stone-200 p-5">
                <pre
                  class="max-h-[34rem] max-w-full overflow-auto rounded-md bg-stone-950 p-4 text-sm leading-6 text-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  tabindex="0"
                  aria-label="Debug inspection data in JSON"
                  >{{ JSON.stringify(report, null, 2) }}</pre
                >
              </div>
            </details>
          </div>
        </div>

        <div
          v-else-if="!errorMessage"
          class="rounded-lg border border-dashed border-stone-300 p-8"
          role="status"
        >
          <p class="text-stone-600">Enter a URL to inspect media metadata.</p>
        </div>
      </div>
    </section>
  </main>
</template>
