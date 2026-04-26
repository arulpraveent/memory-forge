import type { Tables } from '~/types/database.types'
import type { CreateDeckInput, UpdateDeckInput } from '../../shared/schemas/deck.schemas'

export type Deck = Tables<'decks'>
export type DeckWithDueCount = Deck & { due_count: number }

export const useDeckStore = defineStore('deck', () => {
  const decks = ref<Deck[]>([])
  const dueDecks = ref<DeckWithDueCount[]>([])
  const loading = ref(false)

  async function fetchDecks() {
    loading.value = true
    try {
      decks.value = await $fetch<Deck[]>('/api/decks')
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDueDecks() {
    loading.value = true
    try {
      dueDecks.value = await $fetch<DeckWithDueCount[]>('/api/decks/due')
    }
    finally {
      loading.value = false
    }
  }

  async function createDeck(input: CreateDeckInput): Promise<Deck> {
    const deck = await $fetch<Deck>('/api/decks', {
      method: 'POST',
      body: input,
    })
    decks.value.unshift(deck)
    return deck
  }

  async function updateDeck(id: string, input: UpdateDeckInput): Promise<Deck> {
    const updated = await $fetch<Deck>(`/api/decks/${id}`, {
      method: 'PATCH',
      body: input,
    })
    const idx = decks.value.findIndex(d => d.id === id)
    if (idx !== -1) decks.value[idx] = updated
    return updated
  }

  async function deleteDeck(id: string): Promise<void> {
    await $fetch(`/api/decks/${id}`, { method: 'DELETE' })
    decks.value = decks.value.filter(d => d.id !== id)
    dueDecks.value = dueDecks.value.filter(d => d.id !== id)
  }

  return { decks, dueDecks, loading, fetchDecks, fetchDueDecks, createDeck, updateDeck, deleteDeck }
})
