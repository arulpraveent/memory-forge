import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './due.get'

const mockUser = { sub: 'user-1' }

const mockDueCards = [
  { id: 'card-1', deck_id: 'deck-1', user_id: 'user-1', front: 'What is the RX-78-2?', back: 'The original Gundam.', difficulty: 0.3, due: '2024-01-01T00:00:00.000Z', elapsed_days: 5, lapses: 0, reps: 2, scheduled_days: 3, stability: 0.5, state: 2, last_review: '2023-12-27T00:00:00.000Z', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'card-2', deck_id: 'deck-2', user_id: 'user-1', front: 'What is a Zaku?', back: 'A Zeon mobile suit.', difficulty: 0.2, due: '2024-01-01T12:00:00.000Z', elapsed_days: 3, lapses: 1, reps: 1, scheduled_days: 2, stability: 0.4, state: 1, last_review: '2023-12-29T00:00:00.000Z', created_at: '2024-01-01', updated_at: '2024-01-01' },
]

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

const mockGetQuery = vi.fn()
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => { vi.stubGlobal('getQuery', mockGetQuery) })
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('GET /api/cards/due', () => {
  it('returns all due cards for the user across all decks', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockDueCards, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockDueCards)
    expect(result).toHaveLength(2)
  })

  it('returns due cards filtered by deck_id when provided', async () => {
    mockGetQuery.mockReturnValue({ deck_id: 'deck-1' })
    const filtered = [mockDueCards[0]]
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: filtered, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(filtered)
    expect(result).toHaveLength(1)
  })

  it('returns an empty array when no cards are due', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: [], error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual([])
  })

  it('throws 401 when user is not authenticated', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 500 on database error', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'Query failed' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
