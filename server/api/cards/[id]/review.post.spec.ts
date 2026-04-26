import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './review.post'

vi.mock('ts-fsrs', () => {
  const updatedFsrsCard = {
    due: new Date('2024-02-01T00:00:00.000Z'),
    stability: 0.5,
    difficulty: 0.3,
    elapsed_days: 1,
    scheduled_days: 3,
    reps: 1,
    lapses: 0,
    state: 1,
    last_review: new Date('2024-01-01T00:00:00.000Z'),
  }
  const log = {
    difficulty: 0.3,
    due: new Date('2024-02-01T00:00:00.000Z'),
    elapsed_days: 1,
    last_elapsed_days: 0,
    scheduled_days: 3,
    stability: 0.5,
    state: 1,
    review: new Date('2024-01-01T00:00:00.000Z'),
    rating: 3,
  }
  const scheduling = {
    1: { card: updatedFsrsCard, log },
    2: { card: updatedFsrsCard, log },
    3: { card: updatedFsrsCard, log },
    4: { card: updatedFsrsCard, log },
  }
  return {
    fsrs: vi.fn(() => ({ repeat: vi.fn().mockReturnValue(scheduling) })),
    Rating: { Again: 1, Hard: 2, Good: 3, Easy: 4 },
  }
})

const mockUser = { sub: 'user-1' }

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

const mockUpdatedCard = {
  ...mockCard,
  difficulty: 0.3,
  due: '2024-02-01T00:00:00.000Z',
  elapsed_days: 1,
  reps: 1,
  scheduled_days: 3,
  stability: 0.5,
  state: 1,
  last_review: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T12:00:00.000Z',
}

// Creates a client where each .from() call consumes the next result in sequence
function createMultiClient(results: { data: unknown; error: unknown }[]) {
  let callIndex = 0
  return {
    from: vi.fn().mockImplementation(() => {
      const result = results[callIndex++] ?? { data: null, error: { message: 'Unexpected extra DB call' } }
      const chain: Record<PropertyKey, unknown> = {
        then(onFulfilled: (v: unknown) => unknown) {
          return Promise.resolve(result).then(onFulfilled)
        },
      }
      const proxy: unknown = new Proxy(chain, {
        get(target, prop: string) {
          if (prop in target) return target[prop]
          return vi.fn().mockReturnValue(proxy)
        },
      })
      return proxy
    }),
  }
}

// Single-result client used for early-exit error cases
function createClient(result: { data: unknown; error: unknown }) {
  const chain: Record<PropertyKey, unknown> = {
    then(onFulfilled: (v: unknown) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  const proxy: unknown = new Proxy(chain, {
    get(target, prop: string) {
      if (prop in target) return target[prop]
      return vi.fn().mockReturnValue(proxy)
    },
  })
  return { from: vi.fn().mockReturnValue(proxy) }
}

const mockGetRouterParam = vi.fn()
const mockReadBody = vi.fn()
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => {
  vi.stubGlobal('getRouterParam', mockGetRouterParam)
  vi.stubGlobal('readBody', mockReadBody)
})
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('POST /api/cards/:id/review', () => {
  describe('auth & input validation', () => {
    it('throws 401 when user is not authenticated', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(null)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
    })

    it('throws 400 when id param is missing', async () => {
      mockGetRouterParam.mockReturnValue(undefined)
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 400 })
    })

    it('throws 422 when rating is missing from body', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({})
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
    })

    it('throws 422 when rating is 0 (below valid range)', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 0 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
    })

    it('throws 422 when rating is 5 (above valid range)', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 5 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
    })

    it('throws 422 when rating is a non-integer float', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 2.5 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
    })
  })

  describe('card fetch', () => {
    it('throws 404 when card is not found (PGRST116)', async () => {
      mockGetRouterParam.mockReturnValue('nonexistent-id')
      mockReadBody.mockResolvedValue({ rating: 3 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('throws 500 on other card fetch errors', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 3 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: null, error: { code: '42P01', message: 'Table not found' } }) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
    })
  })

  describe('FSRS scheduling & DB writes', () => {
    it('returns the updated card on a successful review', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 3 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createMultiClient([
          { data: mockCard, error: null },
          { data: mockUpdatedCard, error: null },
          { data: null, error: null },
        ]) as never,
      )

      const result = await handler(mockEvent)

      expect(result).toEqual(mockUpdatedCard)
    })

    it('accepts all four valid ratings (1–4)', async () => {
      for (const rating of [1, 2, 3, 4]) {
        mockGetRouterParam.mockReturnValue('card-1')
        mockReadBody.mockResolvedValue({ rating })
        vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
        vi.mocked(serverSupabaseClient).mockResolvedValue(
          createMultiClient([
            { data: mockCard, error: null },
            { data: mockUpdatedCard, error: null },
            { data: null, error: null },
          ]) as never,
        )

        await expect(handler(mockEvent)).resolves.toEqual(mockUpdatedCard)
        vi.clearAllMocks()
      }
    })

    it('throws 500 when the card update fails', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 3 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createMultiClient([
          { data: mockCard, error: null },
          { data: null, error: { message: 'Update failed' } },
        ]) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
    })

    it('throws 500 when the review log insert fails', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      mockReadBody.mockResolvedValue({ rating: 3 })
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createMultiClient([
          { data: mockCard, error: null },
          { data: mockUpdatedCard, error: null },
          { data: null, error: { message: 'Insert failed' } },
        ]) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
    })
  })
})
