<script setup lang="ts">
import { imageUrl, type PreviewAsset } from "../lib/preview";

defineProps<{
  asset: PreviewAsset | null;
  missingText: string;
}>();
</script>

<template>
  <img
    v-if="imageUrl(asset)"
    :src="imageUrl(asset) ?? undefined"
    alt=""
    class="size-full object-cover"
  />
  <div
    v-else
    class="flex size-full items-center justify-center px-4 text-sm font-medium text-stone-500"
  >
    {{ missingText }}
  </div>
</template>
