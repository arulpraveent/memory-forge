<script setup lang="ts">
import type { Deck } from '~/stores/deck'

definePageMeta({ layout: 'default' })

const deckStore = useDeckStore()

const modalOpen = ref(false)
const editingDeck = ref<Deck | null>(null)
const deletingId = ref<string | null>(null)

onMounted(() => deckStore.fetchDecks())

function openCreate() {
  editingDeck.value = null
  modalOpen.value = true
}

function openEdit(deck: Deck) {
  editingDeck.value = deck
  modalOpen.value = true
}

async function handleDelete(id: string) {
  deletingId.value = id
  try {
    await deckStore.deleteDeck(id)
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Page header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <div class="h-px w-16 bg-frame-500 mb-4 animate-expand-x" />
        <h1 class="font-mecha text-3xl font-bold text-white tracking-widest uppercase">
          Hangar Bay
        </h1>
        <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">
          Manage your combat data modules
        </p>
      </div>

      <button
        class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-2 mt-4"
        style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        @click="openCreate"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        Deploy Module
      </button>
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

    <!-- Decks grid -->
    <div v-else-if="deckStore.decks.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <DeckManageCard
        v-for="deck in deckStore.decks"
        :key="deck.id"
        :deck="deck"
        :deleting="deletingId === deck.id"
        @edit="openEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="w-16 h-16 bg-armor-800 border border-armor-600 flex items-center justify-center mb-6" style="clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);">
        <Icon name="lucide:database" class="w-7 h-7 text-weapon-500" />
      </div>
      <h2 class="font-mecha text-xl font-bold text-white tracking-widest uppercase mb-2">
        No Data Modules Detected
      </h2>
      <p class="font-ui text-weapon-400 text-sm tracking-wider mb-6">
        Deploy your first module to begin building your arsenal.
      </p>
      <button
        class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-2"
        style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        @click="openCreate"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        Deploy First Module
      </button>
    </div>

    <!-- Create / Edit modal -->
    <DeckModal
      v-model="modalOpen"
      :deck="editingDeck"
    />
  </div>
</template>
