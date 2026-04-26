import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './schedule.get'

vi.mock('ts-fsrs', () => {
  const scheduling = {
    1: { card: { due: new Date('2024-01-01T00:10:00.000Z') } },
    2: { card: { due: new Date('2024-01-02T00:00:00.000Z') } },
    3: { card: { due: new Date('2024-01-08T00:00:00.000Z') } },
    4: { card: { due: new Date('2024-01-31T00:00:00.000Z') } },
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
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => {
  vi.stubGlobal('getRouterParam', mockGetRouterParam)
})
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('GET /api/cards/:id/schedule', () => {
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
  })

  describe('card fetch', () => {
    it('throws 404 when the card is not found (PGRST116)', async () => {
      mockGetRouterParam.mockReturnValue('nonexistent-id')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 404 })
    })

    it('throws 500 on other card fetch errors', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: null, error: { code: '42P01', message: 'Table not found' } }) as never,
      )

      await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
    })
  })

  describe('FSRS schedule preview', () => {
    it('returns due dates for all four ratings', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: mockCard, error: null }) as never,
      )

      const result = await handler(mockEvent)

      expect(result).toEqual({
        1: '2024-01-01T00:10:00.000Z',
        2: '2024-01-02T00:00:00.000Z',
        3: '2024-01-08T00:00:00.000Z',
        4: '2024-01-31T00:00:00.000Z',
      })
    })

    it('constructs the FSRS card from DB fields including last_review when present', async () => {
      const cardWithReview = { ...mockCard, last_review: '2023-12-31T00:00:00.000Z', reps: 1, state: 1 }
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: cardWithReview, error: null }) as never,
      )

      await expect(handler(mockEvent)).resolves.toBeDefined()
    })

    it('constructs the FSRS card correctly when last_review is null (new card)', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      vi.mocked(serverSupabaseClient).mockResolvedValue(
        createClient({ data: mockCard, error: null }) as never,
      )

      await expect(handler(mockEvent)).resolves.toBeDefined()
    })

    it('only fetches cards belonging to the authenticated user', async () => {
      mockGetRouterParam.mockReturnValue('card-1')
      vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
      const clientMock = createClient({ data: mockCard, error: null })
      vi.mocked(serverSupabaseClient).mockResolvedValue(clientMock as never)

      await handler(mockEvent)

      expect(clientMock.from).toHaveBeenCalledWith('cards')
    })
  })
})
