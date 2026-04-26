import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './index.get'

const mockUser = { id: 'user-1' }

const mockDecks = [
  { id: 'deck-1', user_id: 'user-1', name: 'UC Tactics', description: null, created_at: '2024-01-01', updated_at: '2024-01-02' },
  { id: 'deck-2', user_id: 'user-1', name: 'Operation Meteor', description: 'Wing Zero data', created_at: '2024-01-01', updated_at: '2024-01-01' },
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

describe('GET /api/decks', () => {
  it('returns all decks for authenticated user', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockDecks, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockDecks)
  })

  it('throws 401 when user is not authenticated', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 500 when the database returns an error', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'DB failure' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
