<script setup lang="ts">
import type { Deck } from '~/stores/deck'

defineProps<{
  deck: Deck
  deleting?: boolean
}>()

const emit = defineEmits<{
  edit: [deck: Deck]
  delete: [id: string]
}>()

const confirming = ref(false)
</script>

<template>
  <div
    class="bg-armor-800 border border-armor-600 p-6 relative flex flex-col gap-4 transition-all duration-200 hover:border-weapon-500 animate-slide-up"
    style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
  >
    <!-- Gold accent bar -->
    <div class="absolute top-0 left-0 w-12 h-0.5 bg-frame-500" />

    <!-- Decal dot -->
    <span class="absolute top-4 right-6 w-2 h-2 bg-decal-500 block animate-pulse-decal" />

    <!-- Deck info -->
    <div class="flex-1">
      <h3 class="font-mecha text-lg font-bold text-white tracking-wider uppercase leading-snug pr-6">
        {{ deck.name }}
      </h3>
      <p class="font-ui text-weapon-400 text-sm mt-1 line-clamp-2">
        {{ deck.description || 'No briefing filed.' }}
      </p>
    </div>

    <!-- Meta -->
    <div class="font-ui text-xs text-weapon-500 tracking-wider flex items-center gap-4">
      <span class="flex items-center gap-1">
        <Icon name="lucide:calendar" class="w-3 h-3" />
        {{ new Date(deck.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}
      </span>
    </div>

    <!-- Actions -->
    <div class="border-t border-armor-600 pt-4">
      <!-- Normal state -->
      <div v-if="!confirming" class="flex items-center gap-2">
        <button
          class="flex-1 font-mecha text-xs font-bold tracking-widest uppercase py-2 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          @click="emit('edit', deck)"
        >
          <Icon name="lucide:pencil" class="w-3.5 h-3.5" />
          Update Intel
        </button>
        <button
          class="font-mecha text-xs font-bold tracking-widest uppercase py-2 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-decal-600/30 hover:border-decal-500 hover:text-decal-500 transition-all duration-200 active:scale-95 flex items-center gap-2"
          style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          @click.prevent="confirming = true"
        >
          <Icon name="lucide:trash-2" class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Confirm delete state -->
      <div v-else class="flex items-center gap-2">
        <p class="font-ui text-xs text-weapon-400 tracking-wider mr-auto">
          Decommission module?
        </p>
        <button
          :disabled="deleting"
          class="font-mecha text-xs font-bold tracking-widest uppercase py-2 px-3 bg-decal-600/20 border border-decal-500 text-decal-500 hover:bg-decal-600/40 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          @click="emit('delete', deck.id)"
        >
          <span v-if="deleting" class="w-3 h-3 border border-decal-500 border-t-transparent animate-spin block" />
          Confirm
        </button>
        <button
          class="font-mecha text-xs font-bold tracking-widest uppercase py-2 px-3 bg-armor-700 border border-armor-600 text-weapon-400 hover:text-white transition-all duration-200 active:scale-95"
          style="clip-path: polygon(0 0, calc(100% - 0.5rem) 0, 100% 0.5rem, 100% 100%, 0 100%);"
          @click.prevent="confirming = false"
        >
          Abort
        </button>
      </div>
    </div>
  </div>
</template>
