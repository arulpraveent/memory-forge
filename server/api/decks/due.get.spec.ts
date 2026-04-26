import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './due.get'

const mockUser = { id: 'user-1' }

const mockRawDecks = [
  {
    id: 'deck-1',
    user_id: 'user-1',
    name: 'UC Tactics',
    description: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-02',
    cards: [{ count: 7 }],
  },
  {
    id: 'deck-2',
    user_id: 'user-1',
    name: 'Operation Meteor',
    description: 'Wing Zero data',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    cards: [{ count: 3 }],
  },
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

const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => { vi.stubGlobal('getRouterParam', vi.fn()) })
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('GET /api/decks/due', () => {
  it('returns decks with due_count mapped from cards', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: mockRawDecks, error: null }) as never,
    )

    const result = await handler(mockEvent) as Array<Record<string, unknown>>

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'deck-1', due_count: 7 })
    expect(result[1]).toMatchObject({ id: 'deck-2', due_count: 3 })
  })

  it('does not include the raw cards array in the response', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: mockRawDecks, error: null }) as never,
    )

    const result = await handler(mockEvent) as Array<Record<string, unknown>>

    result.forEach(deck => {
      expect(deck).not.toHaveProperty('cards')
    })
  })

  it('returns due_count of 0 when cards array is empty', async () => {
    const rawWithNoCards = [{ ...mockRawDecks[0], cards: [] }]
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: rawWithNoCards, error: null }) as never,
    )

    const result = await handler(mockEvent) as Array<Record<string, unknown>>

    expect(result[0]).toMatchObject({ due_count: 0 })
  })

  it('throws 401 when user is not authenticated', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 500 on database error', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'Query failed' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
