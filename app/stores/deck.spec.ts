import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDeckStore } from './deck'

const mockDeck = {
  id: 'deck-1',
  user_id: 'user-1',
  name: 'UC Tactics',
  description: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockDueDeck = { ...mockDeck, id: 'deck-2', name: 'Operation Meteor', due_count: 5 }

const mockFetch = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubGlobal('$fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('useDeckStore', () => {
  describe('fetchDecks', () => {
    it('populates decks from the API response', async () => {
      mockFetch.mockResolvedValue([mockDeck])
      const store = useDeckStore()

      await store.fetchDecks()

      expect(store.decks).toEqual([mockDeck])
    })

    it('resets loading to false after a successful fetch', async () => {
      mockFetch.mockResolvedValue([mockDeck])
      const store = useDeckStore()

      await store.fetchDecks()

      expect(store.loading).toBe(false)
    })

    it('resets loading to false even when the fetch throws', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const store = useDeckStore()

      await expect(store.fetchDecks()).rejects.toThrow()
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchDueDecks', () => {
    it('populates dueDecks from the API response', async () => {
      mockFetch.mockResolvedValue([mockDueDeck])
      const store = useDeckStore()

      await store.fetchDueDecks()

      expect(store.dueDecks).toEqual([mockDueDeck])
    })

    it('resets loading to false after fetch', async () => {
      mockFetch.mockResolvedValue([])
      const store = useDeckStore()

      await store.fetchDueDecks()

      expect(store.loading).toBe(false)
    })
  })

  describe('createDeck', () => {
    it('calls POST /api/decks with the correct payload', async () => {
      mockFetch.mockResolvedValue(mockDeck)
      const store = useDeckStore()

      await store.createDeck({ name: 'UC Tactics' })

      expect(mockFetch).toHaveBeenCalledWith('/api/decks', {
        method: 'POST',
        body: { name: 'UC Tactics' },
      })
    })

    it('prepends the new deck to the decks list', async () => {
      const existing = { ...mockDeck, id: 'deck-old' }
      const store = useDeckStore()
      store.decks = [existing]
      mockFetch.mockResolvedValue(mockDeck)

      await store.createDeck({ name: 'UC Tactics' })

      expect(store.decks[0]).toEqual(mockDeck)
      expect(store.decks[1]).toEqual(existing)
    })

    it('returns the created deck', async () => {
      mockFetch.mockResolvedValue(mockDeck)
      const store = useDeckStore()

      const result = await store.createDeck({ name: 'UC Tactics' })

      expect(result).toEqual(mockDeck)
    })
  })

  describe('updateDeck', () => {
    it('calls PATCH /api/decks/:id with the correct payload', async () => {
      mockFetch.mockResolvedValue({ ...mockDeck, name: 'Updated' })
      const store = useDeckStore()

      await store.updateDeck('deck-1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith('/api/decks/deck-1', {
        method: 'PATCH',
        body: { name: 'Updated' },
      })
    })

    it('replaces the deck in-place within the decks array', async () => {
      const updated = { ...mockDeck, name: 'Updated' }
      const store = useDeckStore()
      store.decks = [mockDeck]
      mockFetch.mockResolvedValue(updated)

      await store.updateDeck('deck-1', { name: 'Updated' })

      expect(store.decks[0]).toEqual(updated)
    })

    it('does not mutate the array if the deck id is not found', async () => {
      const updated = { ...mockDeck, id: 'deck-99', name: 'Ghost' }
      const store = useDeckStore()
      store.decks = [mockDeck]
      mockFetch.mockResolvedValue(updated)

      await store.updateDeck('deck-99', { name: 'Ghost' })

      expect(store.decks).toHaveLength(1)
      expect(store.decks[0]).toEqual(mockDeck)
    })
  })

  describe('deleteDeck', () => {
    it('calls DELETE /api/decks/:id', async () => {
      mockFetch.mockResolvedValue({ success: true })
      const store = useDeckStore()
      store.decks = [mockDeck]

      await store.deleteDeck('deck-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/decks/deck-1', { method: 'DELETE' })
    })

    it('removes the deck from the decks list', async () => {
      mockFetch.mockResolvedValue({ success: true })
      const store = useDeckStore()
      store.decks = [mockDeck, { ...mockDeck, id: 'deck-2' }]

      await store.deleteDeck('deck-1')

      expect(store.decks).toHaveLength(1)
      expect(store.decks[0]!.id).toBe('deck-2')
    })

    it('removes the deck from dueDecks as well', async () => {
      mockFetch.mockResolvedValue({ success: true })
      const store = useDeckStore()
      store.dueDecks = [{ ...mockDeck, due_count: 3 }]

      await store.deleteDeck('deck-1')

      expect(store.dueDecks).toHaveLength(0)
    })
  })
})
