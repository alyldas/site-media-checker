<script setup lang="ts">
import {
  assetMeta,
  faviconRole,
  faviconSourceLabel,
  formatSizes,
  imageUrl,
  type PreviewAsset,
} from "../lib/preview";

defineProps<{
  asset: PreviewAsset;
  fallbackText: string;
}>();
</script>

<template>
  <article
    class="grid min-w-0 grid-cols-[3.25rem_minmax(0,1fr)] gap-3 rounded-md border border-white/70 bg-white p-3"
  >
    <div
      class="flex size-13 items-center justify-center rounded-md border border-stone-200 bg-white"
    >
      <img
        v-if="imageUrl(asset)"
        :src="imageUrl(asset) ?? undefined"
        alt=""
        class="max-h-9 max-w-9 object-contain"
      />
      <span
        v-else
        class="text-base font-semibold text-stone-500"
        aria-hidden="true"
        >{{ fallbackText }}</span
      >
    </div>
    <div class="min-w-0">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <p class="text-sm font-semibold text-stone-950">
          {{ assetMeta(asset) }}
        </p>
        <p
          class="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600"
        >
          {{ faviconRole(asset) }}
        </p>
      </div>
      <dl class="mt-2 grid min-w-0 gap-1 text-xs leading-5 text-stone-600">
        <div class="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-2">
          <dt class="font-semibold text-stone-500">from</dt>
          <dd class="text-anywhere min-w-0">
            {{ faviconSourceLabel(asset) }}
          </dd>
        </div>
        <div
          v-if="asset.declaredSizes"
          class="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-2"
        >
          <dt class="font-semibold text-stone-500">sizes</dt>
          <dd class="text-anywhere min-w-0">
            {{ asset.declaredSizes }}
          </dd>
        </div>
        <div
          v-if="formatSizes(asset.sizes)"
          class="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-2"
        >
          <dt class="font-semibold text-stone-500">detected</dt>
          <dd class="text-anywhere min-w-0">
            {{ formatSizes(asset.sizes) }}
          </dd>
        </div>
        <div
          v-if="asset.declaredMedia"
          class="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-2"
        >
          <dt class="font-semibold text-stone-500">media</dt>
          <dd class="text-anywhere min-w-0">
            {{ asset.declaredMedia }}
          </dd>
        </div>
        <div
          v-if="asset.resolvedUrl"
          class="grid min-w-0 grid-cols-[4.75rem_minmax(0,1fr)] gap-2"
        >
          <dt class="font-semibold text-stone-500">url</dt>
          <dd class="truncate">{{ asset.resolvedUrl }}</dd>
        </div>
      </dl>
    </div>
  </article>
</template>
