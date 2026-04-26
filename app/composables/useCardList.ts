export function useCardList() {
  const cardStore = useCardStore()
  const error = ref('')

  const cards = computed(() => cardStore.cards)
  const dueCards = computed(() => cardStore.dueCards)
  const loading = computed(() => cardStore.loading)

  async function fetchCards(deckId?: string) {
    error.value = ''
    try {
      await cardStore.fetchCards(deckId)
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
  }

  async function fetchDueCards(deckId?: string) {
    error.value = ''
    try {
      await cardStore.fetchDueCards(deckId)
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
  }

  async function removeCard(id: string) {
    error.value = ''
    try {
      await cardStore.deleteCard(id)
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
  }

  return { cards, dueCards, loading, error, fetchCards, fetchDueCards, removeCard }
}
