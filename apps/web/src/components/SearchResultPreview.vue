<script setup lang="ts">
import { Moon, SearchCheck, Sun } from "lucide-vue-next";
import { imageUrl, type PreviewAsset } from "../lib/preview";

defineProps<{
  faviconAsset: PreviewAsset | null;
  pageDescription: string;
  pageHost: string;
  pageTitle: string;
  fallbackText: string;
}>();
</script>

<template>
  <article
    class="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4"
    :aria-label="`Search result light and dark preview for ${pageTitle}`"
  >
    <p class="flex items-center gap-1.5 text-sm font-semibold text-sky-800">
      <SearchCheck class="size-4 shrink-0" aria-hidden="true" />
      <span>Search result</span>
    </p>
    <div class="mt-4 grid gap-3 lg:grid-cols-2">
      <div class="rounded-md border border-sky-200 bg-white p-4">
        <p
          class="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-stone-500"
        >
          <Sun class="size-3.5" aria-hidden="true" />
          <span>Light</span>
        </p>
        <div class="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <div
            class="flex size-8 items-center justify-center rounded-full border border-sky-200 bg-white"
          >
            <img
              v-if="imageUrl(faviconAsset)"
              :src="imageUrl(faviconAsset) ?? undefined"
              alt=""
              class="size-5 object-contain"
            />
            <span
              v-else
              class="text-sm font-semibold text-sky-800"
              aria-hidden="true"
              >{{ fallbackText }}</span
            >
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm text-stone-700">{{ pageHost }}</p>
            <h3
              class="text-anywhere mt-1 line-clamp-2 text-base font-semibold leading-5 text-sky-900"
            >
              {{ pageTitle }}
            </h3>
            <p
              class="text-anywhere mt-1 line-clamp-2 text-sm leading-5 text-stone-700"
            >
              {{ pageDescription }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-md border border-stone-800 bg-stone-950 p-4">
        <p
          class="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-stone-400"
        >
          <Moon class="size-3.5" aria-hidden="true" />
          <span>Dark</span>
        </p>
        <div class="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <div
            class="flex size-8 items-center justify-center rounded-full border border-white/15 bg-stone-900"
          >
            <img
              v-if="imageUrl(faviconAsset)"
              :src="imageUrl(faviconAsset) ?? undefined"
              alt=""
              class="size-5 object-contain"
            />
            <span
              v-else
              class="text-sm font-semibold text-stone-300"
              aria-hidden="true"
              >{{ fallbackText }}</span
            >
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm text-stone-400">{{ pageHost }}</p>
            <h3
              class="text-anywhere mt-1 line-clamp-2 text-base font-semibold leading-5 text-sky-300"
            >
              {{ pageTitle }}
            </h3>
            <p
              class="text-anywhere mt-1 line-clamp-2 text-sm leading-5 text-stone-300"
            >
              {{ pageDescription }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
