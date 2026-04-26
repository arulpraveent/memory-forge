<script setup lang="ts">
import type { Card } from '~/stores/card'

definePageMeta({ layout: 'default' })

const route = useRoute()
const deckId = route.params.id as string

const { data: deck } = await useFetch(`/api/decks/${deckId}`)

const { cards, loading, error, fetchCards, removeCard } = useCardList()

const modalOpen = ref(false)
const editingCard = ref<Card | null>(null)
const deletingId = ref<string | null>(null)

onMounted(() => fetchCards(deckId))

function openCreate() {
  editingCard.value = null
  modalOpen.value = true
}

function openEdit(card: Card) {
  editingCard.value = card
  modalOpen.value = true
}

async function handleDelete(id: string) {
  deletingId.value = id
  try {
    await removeCard(id)
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="animate-fade-in">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 mb-6 font-ui text-xs text-weapon-500 tracking-widest uppercase">
      <NuxtLink to="/decks" class="hover:text-frame-500 transition-colors flex items-center gap-1.5">
        <Icon name="lucide:layout-grid" class="w-3 h-3" />
        Hangar
      </NuxtLink>
      <Icon name="lucide:chevron-right" class="w-3 h-3" />
      <span class="text-weapon-400 truncate max-w-48">{{ deck?.name ?? 'Module' }}</span>
      <Icon name="lucide:chevron-right" class="w-3 h-3" />
      <span class="text-frame-500">Data Cards</span>
    </div>

    <!-- Page header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <div class="h-px w-16 bg-frame-500 mb-4 animate-expand-x" />
        <h1 class="font-mecha text-3xl font-bold text-white tracking-widest uppercase">
          {{ deck?.name ?? 'Data Module' }}
        </h1>
        <p class="font-ui text-weapon-400 text-sm mt-1 tracking-wider uppercase">
          Data card management
        </p>
      </div>

      <button
        class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-2 mt-4"
        style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        @click="openCreate"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        Deploy Card
      </button>
    </div>

    <!-- Error -->
    <Transition name="error-slide">
      <div v-if="error" class="flex items-start gap-2 bg-decal-600/20 border border-decal-500 px-4 py-3 mb-6">
        <span class="w-1.5 h-1.5 bg-decal-500 mt-1.5 shrink-0 block" />
        <p class="font-ui text-decal-500 text-sm leading-snug">{{ error }}</p>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="n in 4"
        :key="n"
        class="h-20 bg-armor-800 border border-armor-600 animate-pulse"
        style="clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 1rem, 100% 100%, 0 100%);"
      />
    </div>

    <!-- Card list -->
    <div v-else-if="cards.length" class="space-y-3">
      <CardManageRow
        v-for="(card, i) in cards"
        :key="card.id"
        :card="card"
        :index="i"
        :deleting="deletingId === card.id"
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
        <Icon name="lucide:file-question" class="w-7 h-7 text-weapon-500" />
      </div>
      <h2 class="font-mecha text-xl font-bold text-white tracking-widest uppercase mb-2">
        No Data Cards Detected
      </h2>
      <p class="font-ui text-weapon-400 text-sm tracking-wider mb-6">
        Deploy your first card to populate this module.
      </p>
      <button
        class="font-mecha text-sm font-bold tracking-widest uppercase py-3 px-6 bg-armor-700 border border-armor-600 text-white hover:bg-frame-500 hover:text-armor-900 hover:border-frame-500 hover:shadow-glow-gold transition-all duration-200 active:scale-95 flex items-center gap-2"
        style="clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 0.75rem, 100% 100%, 0 100%);"
        @click="openCreate"
      >
        <Icon name="lucide:plus" class="w-4 h-4" />
        Deploy First Card
      </button>
    </div>

    <CardModal
      v-model="modalOpen"
      :deck-id="deckId"
      :card="editingCard"
      @saved="fetchCards(deckId)"
    />
  </div>
</template>
