<script setup lang="ts">
definePageMeta({ layout: 'default' })

const deckStore = useDeckStore()

onMounted(() => deckStore.fetchDueDecks())
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page header -->
    <div class="mb-8">
      <div class="h-px w-16 bg-frame-500 mb-4 animate-expand-x" />
      <h1 class="font-mecha text-3xl font-bold text-white tracking-widest uppercase">
        Active Sorties
      </h1>
      <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">
        Data modules requiring immediate review
      </p>
    </div>

    <!-- Loading -->
    <div v-if="deckStore.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="n in 3"
        :key="n"
        class="h-48 bg-armor-800 border border-armor-600 animate-pulse"
        style="clip-path: polygon(0 0, calc(100% - 1.5rem) 0, 100% 1.5rem, 100% 100%, 0 100%);"
      />
    </div>

    <!-- Due decks grid -->
    <div v-else-if="deckStore.dueDecks.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <DeckCard
        v-for="deck in deckStore.dueDecks"
        :key="deck.id"
        :deck="deck"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="w-16 h-16 bg-armor-800 border border-armor-600 flex items-center justify-center mb-6" style="clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);">
        <Icon name="lucide:shield-check" class="w-7 h-7 text-frame-500" />
      </div>
      <h2 class="font-mecha text-xl font-bold text-white tracking-widest uppercase mb-2">
        All Systems Nominal
      </h2>
      <p class="font-ui text-weapon-400 text-sm tracking-wider">
        No active sorties required. All data modules are current.
      </p>
      <NuxtLink
        to="/decks"
        class="mt-6 font-mecha text-xs tracking-widest uppercase px-5 py-2.5 bg-armor-700 border border-armor-600 text-weapon-400 hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95"
        style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
      >
        Visit Hangar
      </NuxtLink>
    </div>
  </div>
</template>
