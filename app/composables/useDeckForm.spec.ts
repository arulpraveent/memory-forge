import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useDeckForm } from './useDeckForm'
import type { Deck } from '~/stores/deck'

const mockCreateDeck = vi.fn()
const mockUpdateDeck = vi.fn()

mockNuxtImport('useDeckStore', () => () => ({
  createDeck: mockCreateDeck,
  updateDeck: mockUpdateDeck,
}))

const mockDeck: Deck = {
  id: 'deck-1',
  user_id: 'user-1',
  name: 'UC Tactics',
  description: 'Existing briefing',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useDeckForm', () => {
  describe('initial state', () => {
    it('isEditing is false when no deck is provided', () => {
      const { isEditing } = useDeckForm()
      expect(isEditing.value).toBe(false)
    })

    it('isEditing is true when a deck ref is provided', () => {
      const { isEditing } = useDeckForm(ref(mockDeck))
      expect(isEditing.value).toBe(true)
    })

    it('pre-fills name and description from the provided deck', () => {
      const { name, description } = useDeckForm(ref(mockDeck))
      expect(name.value).toBe('UC Tactics')
      expect(description.value).toBe('Existing briefing')
    })

    it('starts with empty fields in create mode', () => {
      const { name, description } = useDeckForm()
      expect(name.value).toBe('')
      expect(description.value).toBe('')
    })
  })

  describe('submit — validation', () => {
    it('sets an error and does not call the store when name is empty', async () => {
      const { submit, error } = useDeckForm()

      await submit()

      expect(error.value).toBe('Module designation is required.')
      expect(mockCreateDeck).not.toHaveBeenCalled()
    })

    it('sets an error and does not call the store when name is only whitespace', async () => {
      const { name, submit, error } = useDeckForm()
      name.value = '   '

      await submit()

      expect(error.value).toBeTruthy()
      expect(mockCreateDeck).not.toHaveBeenCalled()
    })
  })

  describe('submit — create mode', () => {
    it('calls createDeck with trimmed name and description', async () => {
      mockCreateDeck.mockResolvedValue(mockDeck)
      const { name, description, submit } = useDeckForm()
      name.value = '  UC Tactics  '
      description.value = '  Some briefing  '

      await submit()

      expect(mockCreateDeck).toHaveBeenCalledWith({
        name: 'UC Tactics',
        description: 'Some briefing',
      })
    })

    it('omits description from payload when left empty', async () => {
      mockCreateDeck.mockResolvedValue(mockDeck)
      const { name, submit } = useDeckForm()
      name.value = 'UC Tactics'

      await submit()

      expect(mockCreateDeck).toHaveBeenCalledWith({ name: 'UC Tactics', description: undefined })
    })

    it('sets success to true after a successful create', async () => {
      mockCreateDeck.mockResolvedValue(mockDeck)
      const { name, success, submit } = useDeckForm()
      name.value = 'UC Tactics'

      await submit()

      expect(success.value).toBe(true)
    })

    it('resets loading to false after a successful create', async () => {
      mockCreateDeck.mockResolvedValue(mockDeck)
      const { name, loading, submit } = useDeckForm()
      name.value = 'UC Tactics'

      await submit()

      expect(loading.value).toBe(false)
    })
  })

  describe('submit — edit mode', () => {
    it('calls updateDeck with the deck id and updated payload', async () => {
      mockUpdateDeck.mockResolvedValue({ ...mockDeck, name: 'Updated Tactics' })
      const deckRef = ref(mockDeck)
      const { name, submit } = useDeckForm(deckRef)
      name.value = 'Updated Tactics'

      await submit()

      expect(mockUpdateDeck).toHaveBeenCalledWith('deck-1', {
        name: 'Updated Tactics',
        description: 'Existing briefing',
      })
    })

    it('sets success to true after a successful update', async () => {
      mockUpdateDeck.mockResolvedValue(mockDeck)
      const { name, success, submit } = useDeckForm(ref(mockDeck))
      name.value = 'Updated'

      await submit()

      expect(success.value).toBe(true)
    })
  })

  describe('submit — error handling', () => {
    it('extracts the error message from a $fetch error response', async () => {
      mockCreateDeck.mockRejectedValue({ data: { message: 'Module designation is required.' } })
      const { name, error, submit } = useDeckForm()
      name.value = 'Test'

      await submit()

      expect(error.value).toBe('Module designation is required.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      mockCreateDeck.mockRejectedValue(new Error('Network failure'))
      const { name, error, submit } = useDeckForm()
      name.value = 'Test'

      await submit()

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      mockCreateDeck.mockRejectedValue({})
      const { name, error, submit } = useDeckForm()
      name.value = 'Test'

      await submit()

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })

    it('resets loading to false after a failed submit', async () => {
      mockCreateDeck.mockRejectedValue(new Error('Fail'))
      const { name, loading, submit } = useDeckForm()
      name.value = 'Test'

      await submit()

      expect(loading.value).toBe(false)
    })
  })

  describe('reset', () => {
    it('restores name and description to original deck values', () => {
      const { name, description, reset } = useDeckForm(ref(mockDeck))
      name.value = 'Changed'
      description.value = 'Changed'

      reset()

      expect(name.value).toBe('UC Tactics')
      expect(description.value).toBe('Existing briefing')
    })

    it('clears error and success flags', async () => {
      mockCreateDeck.mockResolvedValue(mockDeck)
      const { name, error, success, submit, reset } = useDeckForm()
      name.value = 'Test'
      await submit()

      reset()

      expect(error.value).toBe('')
      expect(success.value).toBe(false)
    })
  })
})
