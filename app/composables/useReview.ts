import type { Card } from '~/stores/card'

export const RATINGS = [
  { value: 1 as const, label: 'Abort', sub: 'Again', style: 'bg-decal-600/20 border-decal-500 text-decal-500 hover:bg-decal-600/40' },
  { value: 2 as const, label: 'Challenging', sub: 'Hard', style: 'bg-armor-700 border-weapon-500 text-weapon-400 hover:bg-weapon-800 hover:text-white' },
  { value: 3 as const, label: 'Confirmed', sub: 'Good', style: 'bg-armor-700 border-armor-600 text-white hover:bg-armor-600' },
  { value: 4 as const, label: 'Optimal', sub: 'Easy', style: 'bg-frame-500/10 border-frame-700 text-frame-500 hover:bg-frame-500 hover:text-armor-900 hover:shadow-glow-gold' },
] as const

export function useReview(deckId: string) {
  const cardStore = useCardStore()

  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const revealed = ref(false)
  const sessionIndex = ref(0)
  const sessionCards = ref<Card[]>([])

  const currentCard = computed(() => sessionCards.value[sessionIndex.value] ?? null)
  const isComplete = computed(() => sessionCards.value.length > 0 && sessionIndex.value >= sessionCards.value.length)
  const progress = computed(() => ({
    current: Math.min(sessionIndex.value + 1, sessionCards.value.length),
    total: sessionCards.value.length,
  }))

  async function init() {
    loading.value = true
    error.value = ''
    try {
      await cardStore.fetchDueCards(deckId)
      sessionCards.value = [...cardStore.dueCards]
      sessionIndex.value = 0
      revealed.value = false
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  function reveal() {
    revealed.value = true
  }

  async function rate(rating: 1 | 2 | 3 | 4) {
    if (!currentCard.value || submitting.value) return
    submitting.value = true
    error.value = ''
    try {
      await $fetch(`/api/cards/${currentCard.value.id}/review`, {
        method: 'POST',
        body: { rating },
      })
      sessionIndex.value++
      revealed.value = false
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
    finally {
      submitting.value = false
    }
  }

  return { loading, submitting, error, revealed, currentCard, isComplete, progress, sessionCards, init, reveal, rate }
}
