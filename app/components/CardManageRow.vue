<script setup lang="ts">
import type { Card } from '~/stores/card'

defineProps<{
  card: Card
  index: number
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: [card: Card]
  delete: [id: string]
}>()

const confirming = ref(false)
</script>

<template>
  <div
    class="bg-armor-800 border border-armor-600 p-5 relative flex items-start gap-4 transition-all duration-200 hover:border-weapon-500 animate-slide-up"
    style="clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);"
  >
    <!-- Gold accent bar -->
    <div class="absolute top-0 left-0 w-8 h-0.5 bg-frame-500" />

    <!-- Index badge -->
    <span
      class="font-mecha text-xs font-bold text-frame-500 tracking-widest shrink-0 w-6 pt-0.5"
    >
      {{ String(index + 1).padStart(2, '0') }}
    </span>

    <!-- Card content -->
    <div class="flex-1 min-w-0 space-y-2">
      <p class="font-ui text-sm text-white leading-snug line-clamp-2">
        {{ card.front }}
      </p>
      <p class="font-ui text-xs text-weapon-400 leading-snug line-clamp-2">
        {{ card.back }}
      </p>
    </div>

    <!-- Actions -->
    <div class="shrink-0">
      <!-- Normal state -->
      <div v-if="!confirming" class="flex items-center gap-2">
        <button
          class="font-mecha text-xs font-bold tracking-widest uppercase py-1.5 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          style="clip-path: polygon(0 0, calc(100% - 0.4rem) 0, 100% 0.4rem, 100% 100%, 0 100%);"
          @click="emit('edit', card)"
        >
          <Icon name="lucide:pencil" class="w-3 h-3" />
          Edit
        </button>
        <button
          class="font-mecha text-xs font-bold tracking-widest uppercase py-1.5 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-decal-600/30 hover:border-decal-500 hover:text-decal-500 transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.4rem) 0, 100% 0.4rem, 100% 100%, 0 100%);"
          @click.prevent="confirming = true"
        >
          <Icon name="lucide:trash-2" class="w-3 h-3" />
        </button>
      </div>

      <!-- Confirm delete -->
      <div v-else class="flex items-center gap-2">
        <button
          :disabled="deleting"
          class="font-mecha text-xs font-bold tracking-widest uppercase py-1.5 px-3 bg-decal-600/20 border border-decal-500 text-decal-500 hover:bg-decal-600/40 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          style="clip-path: polygon(0 0, calc(100% - 0.4rem) 0, 100% 0.4rem, 100% 100%, 0 100%);"
          @click="emit('delete', card.id)"
        >
          <span v-if="deleting" class="w-3 h-3 border border-decal-500 border-t-transparent animate-spin block" />
          Confirm
        </button>
        <button
          class="font-mecha text-xs font-bold tracking-widest uppercase py-1.5 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:text-white transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.4rem) 0, 100% 0.4rem, 100% 100%, 0 100%);"
          @click.prevent="confirming = false"
        >
          Abort
        </button>
      </div>
    </div>
  </div>
</template>
