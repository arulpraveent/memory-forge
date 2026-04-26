import type { Deck } from '~/stores/deck'

export function useDeckForm(deck?: Ref<Deck | null>) {
  const deckStore = useDeckStore()

  const name = ref(deck?.value?.name ?? '')
  const description = ref(deck?.value?.description ?? '')
  const error = ref('')
  const loading = ref(false)
  const success = ref(false)

  const isEditing = computed(() => !!deck?.value)

  async function submit() {
    if (!name.value.trim()) {
      error.value = 'Module designation is required.'
      return
    }

    loading.value = true
    error.value = ''
    success.value = false

    try {
      const payload = {
        name: name.value.trim(),
        description: description.value.trim() || undefined,
      }

      if (deck?.value) {
        await deckStore.updateDeck(deck.value.id, payload)
      }
      else {
        await deckStore.createDeck(payload)
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
    name.value = deck?.value?.name ?? ''
    description.value = deck?.value?.description ?? ''
    error.value = ''
    success.value = false
  }

  return { name, description, error, loading, success, isEditing, submit, reset }
}
