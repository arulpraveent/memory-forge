import type { Tables } from '~/types/database.types'
import type { CreateCardInput, UpdateCardInput } from '../../shared/schemas/card.schemas'

export type Card = Tables<'cards'>

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const dueCards = ref<Card[]>([])
  const loading = ref(false)

  async function fetchCards(deckId?: string) {
    loading.value = true
    try {
      cards.value = await $fetch<Card[]>('/api/cards', {
        query: deckId ? { deck_id: deckId } : {},
      })
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDueCards(deckId?: string) {
    loading.value = true
    try {
      dueCards.value = await $fetch<Card[]>('/api/cards/due', {
        query: deckId ? { deck_id: deckId } : {},
      })
    }
    finally {
      loading.value = false
    }
  }

  async function createCard(input: CreateCardInput): Promise<Card> {
    const card = await $fetch<Card>('/api/cards', {
      method: 'POST',
      body: input,
    })
    cards.value.push(card)
    return card
  }

  async function updateCard(id: string, input: UpdateCardInput): Promise<Card> {
    const updated = await $fetch<Card>(`/api/cards/${id}`, {
      method: 'PATCH',
      body: input,
    })
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx !== -1) cards.value[idx] = updated
    return updated
  }

  async function deleteCard(id: string): Promise<void> {
    await $fetch(`/api/cards/${id}`, { method: 'DELETE' })
    cards.value = cards.value.filter(c => c.id !== id)
  }

  function clearCards() {
    cards.value = []
    dueCards.value = []
  }

  return { cards, dueCards, loading, fetchCards, fetchDueCards, createCard, updateCard, deleteCard, clearCards }
})
