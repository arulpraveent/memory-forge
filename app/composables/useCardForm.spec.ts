import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useCardForm } from './useCardForm'
import type { Card } from '~/stores/card'

const mockCreateCard = vi.fn()
const mockUpdateCard = vi.fn()

mockNuxtImport('useCardStore', () => () => ({
  createCard: mockCreateCard,
  updateCard: mockUpdateCard,
}))

const DECK_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockCard: Card = {
  id: 'card-1',
  deck_id: DECK_ID,
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

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCardForm', () => {
  describe('initial state', () => {
    it('isEditing is false when no card is provided', () => {
      const { isEditing } = useCardForm(DECK_ID)
      expect(isEditing.value).toBe(false)
    })

    it('isEditing is true when a card ref is provided', () => {
      const { isEditing } = useCardForm(DECK_ID, ref(mockCard))
      expect(isEditing.value).toBe(true)
    })

    it('pre-fills front and back from the provided card', () => {
      const { front, back } = useCardForm(DECK_ID, ref(mockCard))
      expect(front.value).toBe('What is the RX-78-2?')
      expect(back.value).toBe('The original Gundam mobile suit.')
    })

    it('starts with empty fields in create mode', () => {
      const { front, back } = useCardForm(DECK_ID)
      expect(front.value).toBe('')
      expect(back.value).toBe('')
    })
  })

  describe('submit — validation', () => {
    it('sets an error and does not call the store when front is empty', async () => {
      const { submit, error } = useCardForm(DECK_ID)

      await submit()

      expect(error.value).toBe('Front side content is required.')
      expect(mockCreateCard).not.toHaveBeenCalled()
    })

    it('sets an error and does not call the store when front is only whitespace', async () => {
      const { front, submit, error } = useCardForm(DECK_ID)
      front.value = '   '

      await submit()

      expect(error.value).toBeTruthy()
      expect(mockCreateCard).not.toHaveBeenCalled()
    })

    it('sets an error and does not call the store when back is empty', async () => {
      const { front, submit, error } = useCardForm(DECK_ID)
      front.value = 'What is the RX-78-2?'

      await submit()

      expect(error.value).toBe('Back side content is required.')
      expect(mockCreateCard).not.toHaveBeenCalled()
    })

    it('sets an error and does not call the store when back is only whitespace', async () => {
      const { front, back, submit, error } = useCardForm(DECK_ID)
      front.value = 'What is the RX-78-2?'
      back.value = '   '

      await submit()

      expect(error.value).toBeTruthy()
      expect(mockCreateCard).not.toHaveBeenCalled()
    })
  })

  describe('submit — create mode', () => {
    it('calls createCard with trimmed front, back, and the deck_id', async () => {
      mockCreateCard.mockResolvedValue(mockCard)
      const { front, back, submit } = useCardForm(DECK_ID)
      front.value = '  What is the RX-78-2?  '
      back.value = '  The original Gundam mobile suit.  '

      await submit()

      expect(mockCreateCard).toHaveBeenCalledWith({
        deck_id: DECK_ID,
        front: 'What is the RX-78-2?',
        back: 'The original Gundam mobile suit.',
      })
    })

    it('sets success to true after a successful create', async () => {
      mockCreateCard.mockResolvedValue(mockCard)
      const { front, back, success, submit } = useCardForm(DECK_ID)
      front.value = 'What is the RX-78-2?'
      back.value = 'The original Gundam mobile suit.'

      await submit()

      expect(success.value).toBe(true)
    })

    it('resets loading to false after a successful create', async () => {
      mockCreateCard.mockResolvedValue(mockCard)
      const { front, back, loading, submit } = useCardForm(DECK_ID)
      front.value = 'What is the RX-78-2?'
      back.value = 'The original Gundam mobile suit.'

      await submit()

      expect(loading.value).toBe(false)
    })
  })

  describe('submit — edit mode', () => {
    it('calls updateCard with the card id and updated payload', async () => {
      mockUpdateCard.mockResolvedValue({ ...mockCard, front: 'Updated front' })
      const cardRef = ref(mockCard)
      const { front, submit } = useCardForm(DECK_ID, cardRef)
      front.value = 'Updated front'

      await submit()

      expect(mockUpdateCard).toHaveBeenCalledWith('card-1', {
        front: 'Updated front',
        back: 'The original Gundam mobile suit.',
      })
    })

    it('does not call createCard in edit mode', async () => {
      mockUpdateCard.mockResolvedValue(mockCard)
      const { front, back, submit } = useCardForm(DECK_ID, ref(mockCard))
      front.value = 'Updated front'
      back.value = 'Updated back'

      await submit()

      expect(mockCreateCard).not.toHaveBeenCalled()
    })

    it('sets success to true after a successful update', async () => {
      mockUpdateCard.mockResolvedValue(mockCard)
      const { front, success, submit } = useCardForm(DECK_ID, ref(mockCard))
      front.value = 'Updated front'

      await submit()

      expect(success.value).toBe(true)
    })
  })

  describe('submit — error handling', () => {
    it('extracts the error message from a $fetch error response', async () => {
      mockCreateCard.mockRejectedValue({ data: { message: 'Front side content is required.' } })
      const { front, back, error, submit } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'

      await submit()

      expect(error.value).toBe('Front side content is required.')
    })

    it('falls back to error.message when data.message is absent', async () => {
      mockCreateCard.mockRejectedValue(new Error('Network failure'))
      const { front, back, error, submit } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'

      await submit()

      expect(error.value).toBe('Network failure')
    })

    it('uses a generic fallback when the error has no message', async () => {
      mockCreateCard.mockRejectedValue({})
      const { front, back, error, submit } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'

      await submit()

      expect(error.value).toBe('An unexpected error occurred. Please try again.')
    })

    it('resets loading to false after a failed submit', async () => {
      mockCreateCard.mockRejectedValue(new Error('Fail'))
      const { front, back, loading, submit } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'

      await submit()

      expect(loading.value).toBe(false)
    })

    it('clears a previous error before each submission attempt', async () => {
      mockCreateCard.mockResolvedValue(mockCard)
      const { front, back, error, submit } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'
      error.value = 'Previous error'

      await submit()

      expect(error.value).toBe('')
    })
  })

  describe('reset', () => {
    it('restores front and back to original card values in edit mode', () => {
      const { front, back, reset } = useCardForm(DECK_ID, ref(mockCard))
      front.value = 'Changed front'
      back.value = 'Changed back'

      reset()

      expect(front.value).toBe('What is the RX-78-2?')
      expect(back.value).toBe('The original Gundam mobile suit.')
    })

    it('clears front and back in create mode', () => {
      const { front, back, reset } = useCardForm(DECK_ID)
      front.value = 'Something typed'
      back.value = 'Something typed'

      reset()

      expect(front.value).toBe('')
      expect(back.value).toBe('')
    })

    it('clears error and success flags', async () => {
      mockCreateCard.mockResolvedValue(mockCard)
      const { front, back, error, success, submit, reset } = useCardForm(DECK_ID)
      front.value = 'Test'
      back.value = 'Test'
      await submit()

      reset()

      expect(error.value).toBe('')
      expect(success.value).toBe(false)
    })
  })
})
