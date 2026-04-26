import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCardStore } from './card'

const mockCard = {
  id: 'card-1',
  deck_id: 'deck-1',
  user_id: 'user-1',
  front: 'What is the RX-78-2?',
  back: 'The original Gundam mobile suit.',
  difficulty: 0,
  due: '2024-01-01T00:00:00.000Z',
  elapsed_days: 0,
  lapses: 0,
  reps: 0,
  scheduled_days: 0,
  stability: 0,
  state: 0,
  last_review: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockFetch = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('$fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('useCardStore', () => {
  describe('fetchCards', () => {
    it('populates cards from the API response when deck_id is provided', async () => {
      mockFetch.mockResolvedValue([mockCard])
      const store = useCardStore()

      await store.fetchCards('deck-1')

      expect(store.cards).toEqual([mockCard])
      expect(mockFetch).toHaveBeenCalledWith('/api/cards', { query: { deck_id: 'deck-1' } })
    })

    it('fetches all user cards when no deck_id is provided', async () => {
      mockFetch.mockResolvedValue([mockCard])
      const store = useCardStore()

      await store.fetchCards()

      expect(store.cards).toEqual([mockCard])
      expect(mockFetch).toHaveBeenCalledWith('/api/cards', { query: {} })
    })

    it('resets loading to false after a successful fetch', async () => {
      mockFetch.mockResolvedValue([mockCard])
      const store = useCardStore()

      await store.fetchCards('deck-1')

      expect(store.loading).toBe(false)
    })

    it('resets loading to false even when the fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const store = useCardStore()

      await expect(store.fetchCards('deck-1')).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchDueCards', () => {
    it('populates dueCards from the API response', async () => {
      mockFetch.mockResolvedValue([mockCard])
      const store = useCardStore()

      await store.fetchDueCards()

      expect(store.dueCards).toEqual([mockCard])
      expect(mockFetch).toHaveBeenCalledWith('/api/cards/due', { query: {} })
    })

    it('fetches due cards scoped to a deck when deck_id is provided', async () => {
      mockFetch.mockResolvedValue([mockCard])
      const store = useCardStore()

      await store.fetchDueCards('deck-1')

      expect(store.dueCards).toEqual([mockCard])
      expect(mockFetch).toHaveBeenCalledWith('/api/cards/due', { query: { deck_id: 'deck-1' } })
    })

    it('resets loading to false after a successful fetch', async () => {
      mockFetch.mockResolvedValue([])
      const store = useCardStore()

      await store.fetchDueCards()

      expect(store.loading).toBe(false)
    })

    it('resets loading to false even when the fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const store = useCardStore()

      await expect(store.fetchDueCards()).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('createCard', () => {
    it('calls POST /api/cards with the correct payload', async () => {
      mockFetch.mockResolvedValue(mockCard)
      const store = useCardStore()

      await store.createCard({ deck_id: 'deck-1', front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })

      expect(mockFetch).toHaveBeenCalledWith('/api/cards', {
        method: 'POST',
        body: { deck_id: 'deck-1', front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' },
      })
    })

    it('appends the new card to the cards list', async () => {
      const existing = { ...mockCard, id: 'card-old' }
      const store = useCardStore()
      store.cards = [existing]
      mockFetch.mockResolvedValue(mockCard)

      await store.createCard({ deck_id: 'deck-1', front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })

      expect(store.cards).toHaveLength(2)
      expect(store.cards[1]).toEqual(mockCard)
    })

    it('returns the created card', async () => {
      mockFetch.mockResolvedValue(mockCard)
      const store = useCardStore()

      const result = await store.createCard({ deck_id: 'deck-1', front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })

      expect(result).toEqual(mockCard)
    })
  })

  describe('updateCard', () => {
    it('calls PATCH /api/cards/:id with the correct payload', async () => {
      mockFetch.mockResolvedValue({ ...mockCard, front: 'Updated front' })
      const store = useCardStore()

      await store.updateCard('card-1', { front: 'Updated front' })

      expect(mockFetch).toHaveBeenCalledWith('/api/cards/card-1', {
        method: 'PATCH',
        body: { front: 'Updated front' },
      })
    })

    it('replaces the card in-place within the cards array', async () => {
      const updated = { ...mockCard, front: 'Updated front' }
      const store = useCardStore()
      store.cards = [mockCard]
      mockFetch.mockResolvedValue(updated)

      await store.updateCard('card-1', { front: 'Updated front' })

      expect(store.cards[0]).toEqual(updated)
    })

    it('does not mutate the array if the card id is not found', async () => {
      const updated = { ...mockCard, id: 'card-99', front: 'Ghost' }
      const store = useCardStore()
      store.cards = [mockCard]
      mockFetch.mockResolvedValue(updated)

      await store.updateCard('card-99', { front: 'Ghost' })

      expect(store.cards).toHaveLength(1)
      expect(store.cards[0]).toEqual(mockCard)
    })

    it('returns the updated card', async () => {
      const updated = { ...mockCard, back: 'Updated back' }
      mockFetch.mockResolvedValue(updated)
      const store = useCardStore()

      const result = await store.updateCard('card-1', { back: 'Updated back' })

      expect(result).toEqual(updated)
    })
  })

  describe('deleteCard', () => {
    it('calls DELETE /api/cards/:id', async () => {
      mockFetch.mockResolvedValue({ success: true })
      const store = useCardStore()
      store.cards = [mockCard]

      await store.deleteCard('card-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/cards/card-1', { method: 'DELETE' })
    })

    it('removes the card from the cards list', async () => {
      mockFetch.mockResolvedValue({ success: true })
      const store = useCardStore()
      store.cards = [mockCard, { ...mockCard, id: 'card-2' }]

      await store.deleteCard('card-1')

      expect(store.cards).toHaveLength(1)
      expect(store.cards[0]!.id).toBe('card-2')
    })
  })

  describe('clearCards', () => {
    it('empties both cards and dueCards', () => {
      const store = useCardStore()
      store.cards = [mockCard]
      store.dueCards = [{ ...mockCard, state: 2 }]

      store.clearCards()

      expect(store.cards).toHaveLength(0)
      expect(store.dueCards).toHaveLength(0)
    })
  })
})
