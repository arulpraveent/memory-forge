import type { Card } from '~/stores/card'

export function useCardForm(deckId: string, card?: Ref<Card | null>) {
  const cardStore = useCardStore()

  const front = ref(card?.value?.front ?? '')
  const back = ref(card?.value?.back ?? '')
  const error = ref('')
  const loading = ref(false)
  const success = ref(false)

  const isEditing = computed(() => !!card?.value)

  async function submit() {
    if (!front.value.trim()) {
      error.value = 'Front side content is required.'
      return
    }
    if (!back.value.trim()) {
      error.value = 'Back side content is required.'
      return
    }

    loading.value = true
    error.value = ''
    success.value = false

    try {
      if (card?.value) {
        await cardStore.updateCard(card.value.id, {
          front: front.value.trim(),
          back: back.value.trim(),
        })
      }
      else {
        await cardStore.createCard({
          deck_id: deckId,
          front: front.value.trim(),
          back: back.value.trim(),
        })
      }
      success.value = true
    }
    catch (e: unknown) {
      const err = e as { data?: { message?: string }; message?: string }
      error.value = err?.data?.message ?? err?.message ?? 'An unexpected error occurred. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    front.value = card?.value?.front ?? ''
    back.value = card?.value?.back ?? ''
    error.value = ''
    success.value = false
  }

  return { front, back, error, loading, success, isEditing, submit, reset }
}
