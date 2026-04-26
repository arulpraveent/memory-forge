import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useCardList } from './useCardList'
import type { Card } from '~/stores/card'

const mockFetchCards = vi.fn()
const mockFetchDueCards = vi.fn()
const mockDeleteCard = vi.fn()

const mockCards: Card[] = [
  { id: 'card-1', deck_id: 'deck-1', user_id: 'user-1', front: 'What is the RX-78-2?', back: 'The original Gundam.', difficulty: 0, due: '2024-01-01T00:00:00.000Z', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'card-2', deck_id: 'deck-1', user_id: 'user-1', front: 'What is a Zaku?', back: 'A Zeon mobile suit.', difficulty: 0, due: '2024-01-02T00:00:00.000Z', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

const mockDueCards: Card[] = [
  { ...mockCards[0]!, state: 2, reps: 3 },
]

let storeCards: Card[] = []
let storeDueCards: Card[] = []
let storeLoading = false

mockNuxtImport('useCardStore', () => () => ({
  get cards() { return storeCards },
  get dueCards() { return storeDueCards },
  get loading() { return storeLoading },
  fetchCards: mockFetchCards,
  fetchDueCards: mockFetchDueCards,
  deleteCard: mockDeleteCard,
}))

beforeEach(() => {
  setActivePinia(createPinia())
  storeCards = []
  storeDueCards = []
  storeLoading = false
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCardList', () => {
  describe('computed state', () => {
    it('exposes cards from the store', () => {
      storeCards = mockCards
      const { cards } = useCardList()
      expect(cards.value).toEqual(mockCards)
    })

    it('exposes dueCards from the store', () => {
      storeDueCards = mockDueCards
      const { dueCards } = useCardList()
      expect(dueCards.value).toEqual(mockDueCards)
    })

    it('exposes loading from the store', () => {
      storeLoading = true
      const { loading } = useCardList()
      expect(loading.value).toBe(true)
    })
  })

  describe('fetchCards', () => {
    it('calls store.fetchCards without a deck_id when none is provided', async () => {
      mockFetchCards.mockResolvedValue(undefined)
      const { fetchCards } = useCardList()

      await fetchCards()

      expect(mockFetchCards).toHaveBeenCalledWith(undefined)
    })

    it('calls store.fetchCards with the provided deck_id', async () => {
      mockFetchCards.mockResolvedValue(undefined)
      const { fetchCards } = useCardList()

      await fetchCards('deck-1')

      expect(mockFetchCards).toHaveBeenCalledWith('deck-1')
    })

    it('clears any previous error before fetching', async () => {
      mockFetchCards.mockResolvedValue(undefined)
      const { fetchCards, error } = useCardList()
      error.value = 'Previous error'

      await fetchCards()

      expect(error.value).toBe('')
    })

    it('sets error from data.message on fetch failure', async () => {
      mockFetchCards.mockRejectedValue({ data: { message: 'Unauthorized. Access denied.' } })
      const { fetchCards, error } = useCardList()

      await fetchCards('deck-1')

      expect(error.value).toBe('Unauthorized. Access denied.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      mockFetchCards.mockRejectedValue(new Error('Network failure'))
      const { fetchCards, error } = useCardList()

      await fetchCards()

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      mockFetchCards.mockRejectedValue({})
      const { fetchCards, error } = useCardList()

      await fetchCards()

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('fetchDueCards', () => {
    it('calls store.fetchDueCards without a deck_id when none is provided', async () => {
      mockFetchDueCards.mockResolvedValue(undefined)
      const { fetchDueCards } = useCardList()

      await fetchDueCards()

      expect(mockFetchDueCards).toHaveBeenCalledWith(undefined)
    })

    it('calls store.fetchDueCards with the provided deck_id', async () => {
      mockFetchDueCards.mockResolvedValue(undefined)
      const { fetchDueCards } = useCardList()

      await fetchDueCards('deck-1')

      expect(mockFetchDueCards).toHaveBeenCalledWith('deck-1')
    })

    it('clears any previous error before fetching', async () => {
      mockFetchDueCards.mockResolvedValue(undefined)
      const { fetchDueCards, error } = useCardList()
      error.value = 'Previous error'

      await fetchDueCards()

      expect(error.value).toBe('')
    })

    it('sets error on fetch failure', async () => {
      mockFetchDueCards.mockRejectedValue({ data: { message: 'DB failure' } })
      const { fetchDueCards, error } = useCardList()

      await fetchDueCards()

      expect(error.value).toBe('DB failure')
    })
  })

  describe('removeCard', () => {
    it('calls store.deleteCard with the correct id', async () => {
      mockDeleteCard.mockResolvedValue(undefined)
      const { removeCard } = useCardList()

      await removeCard('card-1')

      expect(mockDeleteCard).toHaveBeenCalledWith('card-1')
    })

    it('clears any previous error before deleting', async () => {
      mockDeleteCard.mockResolvedValue(undefined)
      const { removeCard, error } = useCardList()
      error.value = 'Previous error'

      await removeCard('card-1')

      expect(error.value).toBe('')
    })

    it('sets error from data.message on delete failure', async () => {
      mockDeleteCard.mockRejectedValue({ data: { message: 'Data card not found.' } })
      const { removeCard, error } = useCardList()

      await removeCard('card-1')

      expect(error.value).toBe('Data card not found.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      mockDeleteCard.mockRejectedValue(new Error('Network failure'))
      const { removeCard, error } = useCardList()

      await removeCard('card-1')

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      mockDeleteCard.mockRejectedValue({})
      const { removeCard, error } = useCardList()

      await removeCard('card-1')

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })
  })
})
