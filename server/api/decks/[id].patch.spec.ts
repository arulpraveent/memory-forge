import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './[id].patch'

const mockUser = { id: 'user-1' }

const mockUpdatedDeck = {
  id: 'deck-1',
  user_id: 'user-1',
  name: 'Updated Tactics',
  description: 'Revised intel',
  created_at: '2024-01-01',
  updated_at: '2024-01-02',
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
const mockReadBody = vi.fn()
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => {
  vi.stubGlobal('getRouterParam', mockGetRouterParam)
  vi.stubGlobal('readBody', mockReadBody)
})
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('PATCH /api/decks/:id', () => {
  it('updates and returns the deck with new name', async () => {
    mockGetRouterParam.mockReturnValue('deck-1')
    mockReadBody.mockResolvedValue({ name: 'Updated Tactics' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockUpdatedDeck, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockUpdatedDeck)
  })

  it('updates description to null (clearing it)', async () => {
    mockGetRouterParam.mockReturnValue('deck-1')
    mockReadBody.mockResolvedValue({ description: null })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: { ...mockUpdatedDeck, description: null }, error: null }) as never,
    )

    const result = await handler(mockEvent)

    expect(result).toMatchObject({ description: null })
  })

  it('throws 401 when user is not authenticated', async () => {
    mockGetRouterParam.mockReturnValue('deck-1')
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 400 when id param is missing', async () => {
    mockGetRouterParam.mockReturnValue(undefined)
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 422 when name is an empty string', async () => {
    mockGetRouterParam.mockReturnValue('deck-1')
    mockReadBody.mockResolvedValue({ name: '' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 404 when deck is not found (PGRST116)', async () => {
    mockGetRouterParam.mockReturnValue('nonexistent-id')
    mockReadBody.mockResolvedValue({ name: 'New Name' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 500 on database error', async () => {
    mockGetRouterParam.mockReturnValue('deck-1')
    mockReadBody.mockResolvedValue({ name: 'New Name' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: '23505', message: 'Unique violation' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
