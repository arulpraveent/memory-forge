import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './index.get'

const mockUser = { sub: 'user-1' }

const mockCards = [
  { id: 'card-1', deck_id: 'deck-1', user_id: 'user-1', front: 'What is the RX-78-2?', back: 'The original Gundam.', difficulty: 0, due: '2024-01-01', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'card-2', deck_id: 'deck-1', user_id: 'user-1', front: 'What is a Zaku?', back: 'A Zeon mass-production mobile suit.', difficulty: 0, due: '2024-01-02', elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 0, stability: 0, state: 0, last_review: null, created_at: '2024-01-02', updated_at: '2024-01-02' },
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

describe('GET /api/cards', () => {
  it('returns all user cards when no deck_id is provided', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockCards, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockCards)
  })

  it('returns cards filtered by deck_id when provided', async () => {
    mockGetQuery.mockReturnValue({ deck_id: 'deck-1' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockCards, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockCards)
  })

  it('throws 401 when user is not authenticated', async () => {
    mockGetQuery.mockReturnValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 500 when the database returns an error', async () => {
    mockGetQuery.mockReturnValue({ deck_id: 'deck-1' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'DB failure' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
