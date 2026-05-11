<script setup lang="ts">
import { ImageIcon } from "lucide-vue-next";
import type { BrowserFaviconSummary } from "../composables/usePreviewData";
import type { FaviconAssetGroup } from "../lib/preview";
import AssetRow from "./AssetRow.vue";

defineProps<{
  groups: FaviconAssetGroup[];
  summary: BrowserFaviconSummary;
  fallbackText: string;
}>();
</script>

<template>
  <section
    class="mt-5 rounded-lg border border-emerald-200 bg-white p-4"
    aria-labelledby="browser-favicon-assets-title"
  >
    <div class="flex min-w-0 flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <h3
          id="browser-favicon-assets-title"
          class="flex items-center gap-1.5 text-sm font-semibold text-emerald-800"
        >
          <ImageIcon class="size-4 shrink-0" aria-hidden="true" />
          <span>Declared browser icons</span>
        </h3>
        <p class="text-anywhere mt-1 text-sm text-stone-600">
          {{ summary.total }} candidates grouped by purpose
          <span v-if="summary.sizes"> · {{ summary.sizes }}</span>
          <span v-if="summary.issues">
            · {{ summary.issues }} issue{{ summary.issues === 1 ? "" : "s" }}
          </span>
        </p>
      </div>
    </div>

    <div v-if="groups.length" class="mt-4 grid min-w-0 gap-3">
      <section
        v-for="group in groups"
        :key="group.key"
        class="rounded-lg border p-3"
        :class="group.className"
      >
        <div class="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h4 class="text-sm font-semibold text-stone-950">
              {{ group.title }}
            </h4>
            <p class="text-anywhere mt-1 text-xs leading-5 text-stone-600">
              {{ group.description }}
            </p>
          </div>
          <p
            class="rounded-md bg-white/80 px-2 py-1 text-xs font-semibold text-stone-600"
          >
            {{ group.assets.length }} item{{
              group.assets.length === 1 ? "" : "s"
            }}
          </p>
        </div>

        <div class="mt-3 grid min-w-0 gap-2 xl:grid-cols-2">
          <AssetRow
            v-for="asset in group.assets"
            :key="
              asset.resolvedUrl ??
              `${asset.kind}-${asset.declaredSizes ?? asset.actualType ?? asset.width ?? asset.height}`
            "
            :asset="asset"
            :fallback-text="fallbackText"
          />
        </div>
      </section>
    </div>

    <div
      v-else
      class="mt-4 rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-600"
    >
      No browser icon assets detected.
    </div>
  </section>
</template>
