<script setup lang="ts">
import { computed } from "vue";
import {
  AtSign,
  MessageCircle,
  MessageSquareText,
  Send,
  Share2,
} from "lucide-vue-next";
import type { PreviewAsset } from "../lib/preview";
import PreviewImageSlot from "./PreviewImageSlot.vue";

const props = defineProps<{
  card: string | null | undefined;
  ogDescription: string;
  ogImageAsset: PreviewAsset | null;
  ogTitle: string;
  pageHost: string;
  pageTitle: string;
  twitterDescription: string;
  twitterHandle: string;
  twitterImageAsset: PreviewAsset | null;
  twitterTitle: string;
}>();

const ogImageMissingText = computed(() =>
  props.ogImageAsset
    ? "Open Graph image invalid or unreachable"
    : "Open Graph image missing"
);
const twitterImageMissingText = computed(() =>
  props.twitterImageAsset
    ? "Twitter/X image invalid or unreachable"
    : "Twitter/X image missing"
);
</script>

<template>
  <article
    class="mt-4 rounded-lg border border-stone-200 bg-white p-4"
    aria-labelledby="social-previews-title"
  >
    <div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <p
        id="social-previews-title"
        class="flex items-center gap-1.5 text-sm font-semibold text-stone-700"
      >
        <Share2 class="size-4 shrink-0 text-emerald-700" aria-hidden="true" />
        <span>Social platform previews</span>
      </p>
      <p
        class="shrink-0 rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600"
      >
        {{ card ?? "summary" }}
      </p>
    </div>

    <div class="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
      <section
        class="rounded-lg border border-stone-800 bg-black p-4 text-white"
        :aria-label="`X post preview for ${twitterTitle}`"
      >
        <p class="sr-only">X / Twitter</p>
        <div class="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black"
          >
            <AtSign class="size-5" aria-hidden="true" />
          </div>
          <div class="min-w-0">
            <div class="flex min-w-0 items-center gap-1 text-sm">
              <span class="truncate font-semibold">{{ pageTitle }}</span>
              <span class="shrink-0 text-stone-500">@{{ twitterHandle }}</span>
            </div>
            <p
              class="text-anywhere mt-1 line-clamp-2 text-sm leading-5 text-stone-100"
            >
              {{ twitterDescription }}
            </p>
            <div
              class="mt-3 aspect-[1.91/1] overflow-hidden rounded-md bg-stone-900"
            >
              <PreviewImageSlot
                :asset="twitterImageAsset"
                :missing-text="twitterImageMissingText"
              />
            </div>
            <h3
              class="text-anywhere mt-3 line-clamp-2 text-sm font-semibold leading-5 text-white"
            >
              {{ twitterTitle }}
            </h3>
            <p class="mt-1 truncate text-xs text-stone-500">{{ pageHost }}</p>
            <div class="mt-3 flex max-w-xs justify-between text-stone-500">
              <MessageCircle class="size-4" aria-hidden="true" />
              <Share2 class="size-4" aria-hidden="true" />
              <MessageSquareText class="size-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section
        class="rounded-lg border border-blue-200 bg-[#f0f2f5] p-4"
        :aria-label="`Facebook link preview for ${ogTitle}`"
      >
        <p class="sr-only">Facebook</p>
        <div class="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white"
          >
            f
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-stone-950">
              {{ pageTitle }}
            </p>
            <p class="text-xs text-stone-500">Sponsored · Public</p>
          </div>
        </div>
        <p
          class="text-anywhere mt-3 line-clamp-2 text-sm leading-5 text-stone-800"
        >
          {{ ogDescription }}
        </p>
        <div class="mt-3 aspect-[1.91/1] overflow-hidden rounded-md bg-white">
          <PreviewImageSlot
            :asset="ogImageAsset"
            :missing-text="ogImageMissingText"
          />
        </div>
        <p class="mt-3 truncate text-xs uppercase text-stone-500">
          {{ pageHost }}
        </p>
        <h3
          class="text-anywhere mt-1 line-clamp-2 text-sm font-semibold leading-5 text-stone-950"
        >
          {{ ogTitle }}
        </h3>
      </section>

      <section
        class="rounded-lg border border-sky-200 bg-[#d8ecff] p-4"
        :aria-label="`Telegram message preview for ${ogTitle}`"
      >
        <p class="sr-only">Telegram</p>
        <p
          class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-sky-700"
        >
          <Send class="size-4" aria-hidden="true" />
          <span class="truncate">{{ pageHost }}</span>
        </p>
        <div class="aspect-[1.91/1] overflow-hidden rounded-lg bg-white">
          <PreviewImageSlot
            :asset="ogImageAsset"
            :missing-text="ogImageMissingText"
          />
        </div>
        <div class="mt-3 border-l-4 border-sky-400 pl-3">
          <h3
            class="text-anywhere line-clamp-2 text-sm font-semibold leading-5 text-stone-950"
          >
            {{ ogTitle }}
          </h3>
          <p
            class="text-anywhere mt-1 line-clamp-2 text-sm leading-5 text-stone-700"
          >
            {{ ogDescription }}
          </p>
        </div>
      </section>

      <section
        class="rounded-lg border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-amber-50 p-4"
        :aria-label="`Instagram direct message link preview for ${ogTitle}`"
      >
        <p class="sr-only">Instagram</p>
        <div
          class="flex min-w-0 items-center justify-between gap-3 border-b border-fuchsia-100 pb-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 via-rose-500 to-amber-400 text-white"
            >
              <AtSign class="size-5" aria-hidden="true" />
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-stone-950">
                {{ pageHost }}
              </p>
              <p class="text-xs text-stone-500">Link preview</p>
            </div>
          </div>
          <Send class="size-5 shrink-0 text-stone-700" aria-hidden="true" />
        </div>
        <div class="mt-3 aspect-[1.91/1] overflow-hidden rounded-xl bg-white">
          <PreviewImageSlot
            :asset="ogImageAsset"
            :missing-text="ogImageMissingText"
          />
        </div>
        <h3
          class="text-anywhere mt-3 line-clamp-2 text-sm font-semibold leading-5 text-stone-950"
        >
          {{ ogTitle }}
        </h3>
        <p
          class="text-anywhere mt-1 line-clamp-2 text-sm leading-5 text-stone-600"
        >
          {{ ogDescription }}
        </p>
      </section>
    </div>
  </article>
</template>
