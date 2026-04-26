<script setup lang="ts">
import type { DeckWithDueCount } from '~/stores/deck'

defineProps<{
  deck: DeckWithDueCount
}>()
</script>

<template>
  <div
    class="bg-armor-800 border border-armor-600 p-6 relative flex flex-col gap-4 transition-all duration-200 hover:border-frame-700 hover:shadow-glow-gunmetal animate-slide-up"
    style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
  >
    <!-- Gold accent bar -->
    <div class="absolute top-0 left-0 w-16 h-0.5 bg-frame-500" />

    <!-- Decal dot -->
    <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

    <!-- Due count badge -->
    <div class="flex items-center gap-2">
      <span
        class="font-mecha text-xs font-bold tracking-widest uppercase px-3 py-1 bg-frame-500/10 border border-frame-700 text-frame-500"
        style="clip-path: polygon(0 0, calc(100% - 0.4rem) 0, 100% 0.4rem, 100% 100%, 0 100%);"
      >
        {{ deck.due_count }} Cards Due
      </span>
    </div>

    <!-- Deck info -->
    <div class="flex-1">
      <h3 class="font-mecha text-lg font-bold text-white tracking-wider uppercase leading-snug">
        {{ deck.name }}
      </h3>
      <p class="font-ui text-weapon-400 text-sm mt-1 line-clamp-2">
        {{ deck.description || 'No briefing filed.' }}
      </p>
    </div>

    <!-- Action -->
    <button
      disabled
      class="w-full font-mecha text-xs font-bold tracking-widest uppercase py-2.5 px-4 bg-armor-700 border border-armor-600 text-weapon-500 cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
      style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
      title="Study sessions coming in a future update"
    >
      <Icon name="lucide:play" class="w-3.5 h-3.5" />
      Begin Sortie
    </button>
  </div>
</template>
