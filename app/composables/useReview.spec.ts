import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useReview } from './useReview'
import type { Card } from '~/stores/card'

const mockFetchDueCards = vi.fn()

const mockCards: Card[] = [
  { id: 'card-1', deck_id: 'deck-1', user_id: 'user-1', front: 'What is the RX-78-2?', back: 'The original Gundam.', difficulty: 0, due: '2024-01-01T00:00:00.000Z', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'card-2', deck_id: 'deck-1', user_id: 'user-1', front: 'What is a Zaku?', back: 'A Zeon mobile suit.', difficulty: 0, due: '2024-01-01T06:00:00.000Z', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
]

let storeDueCards: Card[] = []

mockNuxtImport('useCardStore', () => () => ({
  get dueCards() { return storeDueCards },
  fetchDueCards: mockFetchDueCards,
}))

const mockFetch = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  storeDueCards = []
  vi.stubGlobal('$fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('useReview', () => {
  describe('initial state', () => {
    it('starts with loading false', () => {
      const { loading } = useReview('deck-1')
      expect(loading.value).toBe(false)
    })

    it('starts with no current card', () => {
      const { currentCard } = useReview('deck-1')
      expect(currentCard.value).toBeNull()
    })

    it('starts with isComplete false', () => {
      const { isComplete } = useReview('deck-1')
      expect(isComplete.value).toBe(false)
    })

    it('starts with revealed false', () => {
      const { revealed } = useReview('deck-1')
      expect(revealed.value).toBe(false)
    })
  })

  describe('init()', () => {
    it('calls store.fetchDueCards with the provided deckId', async () => {
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init } = useReview('deck-1')

      await init()

      expect(mockFetchDueCards).toHaveBeenCalledWith('deck-1')
    })

    it('snapshots due cards from the store into sessionCards', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, sessionCards } = useReview('deck-1')

      await init()

      expect(sessionCards.value).toEqual(mockCards)
    })

    it('resets sessionIndex to 0 on each init', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, currentCard } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)
      expect(currentCard.value?.id).toBe('card-2')

      storeDueCards = [mockCards[0]!]
      await init()

      expect(currentCard.value?.id).toBe('card-1')
    })

    it('resets revealed to false on init', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, reveal, revealed } = useReview('deck-1')

      await init()
      reveal()
      expect(revealed.value).toBe(true)

      await init()

      expect(revealed.value).toBe(false)
    })

    it('resets loading to false after a successful init', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, loading } = useReview('deck-1')

      await init()

      expect(loading.value).toBe(false)
    })

    it('resets loading to false when the fetch throws', async () => {
      mockFetchDueCards.mockRejectedValue(new Error('Network error'))
      const { init, loading } = useReview('deck-1')

      await init()

      expect(loading.value).toBe(false)
    })

    it('sets error from data.message on failure', async () => {
      mockFetchDueCards.mockRejectedValue({ data: { message: 'Unauthorized. Access denied.' } })
      const { init, error } = useReview('deck-1')

      await init()

      expect(error.value).toBe('Unauthorized. Access denied.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      mockFetchDueCards.mockRejectedValue(new Error('Network failure'))
      const { init, error } = useReview('deck-1')

      await init()

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      mockFetchDueCards.mockRejectedValue({})
      const { init, error } = useReview('deck-1')

      await init()

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })

    it('clears a previous error on each new init', async () => {
      mockFetchDueCards.mockRejectedValueOnce(new Error('First failure'))
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, error } = useReview('deck-1')

      await init()
      expect(error.value).toBeTruthy()

      await init()

      expect(error.value).toBe('')
    })
  })

  describe('reveal()', () => {
    it('sets revealed to true', () => {
      const { reveal, revealed } = useReview('deck-1')

      reveal()

      expect(revealed.value).toBe(true)
    })
  })

  describe('currentCard computed', () => {
    it('returns the first card after init', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, currentCard } = useReview('deck-1')

      await init()

      expect(currentCard.value).toEqual(mockCards[0])
    })

    it('returns null when sessionCards is empty', () => {
      const { currentCard } = useReview('deck-1')
      expect(currentCard.value).toBeNull()
    })
  })

  describe('isComplete computed', () => {
    it('is false when cards are still remaining', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, isComplete } = useReview('deck-1')

      await init()

      expect(isComplete.value).toBe(false)
    })

    it('is false when there are no cards (prevents false positive on empty session)', async () => {
      storeDueCards = []
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, isComplete } = useReview('deck-1')

      await init()

      expect(isComplete.value).toBe(false)
    })

    it('is true after all cards have been rated', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, isComplete } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(isComplete.value).toBe(true)
    })
  })

  describe('progress computed', () => {
    it('reports total matching session card count', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, progress } = useReview('deck-1')

      await init()

      expect(progress.value.total).toBe(2)
    })

    it('reports current as 1 on the first card', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      const { init, progress } = useReview('deck-1')

      await init()

      expect(progress.value.current).toBe(1)
    })

    it('advances current after each rating', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, progress } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(progress.value.current).toBe(2)
    })
  })

  describe('rate()', () => {
    it('calls the review API with the card id and rating', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(mockFetch).toHaveBeenCalledWith('/api/cards/card-1/review', {
        method: 'POST',
        body: { rating: 3 },
      })
    })

    it('advances to the next card after a successful rating', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, currentCard } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(currentCard.value?.id).toBe('card-2')
    })

    it('resets revealed to false after a successful rating', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, revealed } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(revealed.value).toBe(false)
    })

    it('resets submitting to false after a successful rating', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, submitting } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(submitting.value).toBe(false)
    })

    it('sets error from data.message on API failure', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValue({ data: { message: 'Data card not found.' } })
      const { init, reveal, rate, error } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(error.value).toBe('Data card not found.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValue(new Error('Network failure'))
      const { init, reveal, rate, error } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValue({})
      const { init, reveal, rate, error } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })

    it('resets submitting to false after a failed rating', async () => {
      storeDueCards = [mockCards[0]!]
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValue(new Error('Fail'))
      const { init, reveal, rate, submitting } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(submitting.value).toBe(false)
    })

    it('does not advance the index when the API call fails', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValue(new Error('Fail'))
      const { init, reveal, rate, currentCard } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)

      expect(currentCard.value?.id).toBe('card-1')
    })

    it('is a no-op when there is no current card', async () => {
      const { rate } = useReview('deck-1')

      await rate(3)

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('clears a previous error before each new rating attempt', async () => {
      storeDueCards = mockCards
      mockFetchDueCards.mockResolvedValue(undefined)
      mockFetch.mockRejectedValueOnce(new Error('First failure'))
      mockFetch.mockResolvedValue({})
      const { init, reveal, rate, error } = useReview('deck-1')

      await init()
      reveal()
      await rate(3)
      expect(error.value).toBeTruthy()

      reveal()
      await rate(3)

      expect(error.value).toBe('')
    })
  })
})
