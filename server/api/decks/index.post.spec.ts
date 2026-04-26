import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './index.post'

const mockUser = { sub: 'user-1' }

const mockCreatedDeck = {
  id: 'deck-1',
  user_id: 'user-1',
  name: 'UC Tactics',
  description: 'Mobile suit combat data',
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

const mockReadBody = vi.fn()
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => {
  vi.stubGlobal('getRouterParam', vi.fn())
  vi.stubGlobal('readBody', mockReadBody)
})
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('POST /api/decks', () => {
  it('creates and returns a new deck with valid input', async () => {
    mockReadBody.mockResolvedValue({ name: 'UC Tactics', description: 'Mobile suit combat data' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockCreatedDeck, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockCreatedDeck)
  })

  it('creates a deck with name only (description optional)', async () => {
    mockReadBody.mockResolvedValue({ name: 'Operation Meteor' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: { ...mockCreatedDeck, name: 'Operation Meteor', description: null }, error: null }) as never,
    )

    const result = await handler(mockEvent)

    expect(result).toMatchObject({ name: 'Operation Meteor' })
  })

  it('throws 401 when user is not authenticated', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 422 when name is missing from body', async () => {
    mockReadBody.mockResolvedValue({})
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when name is an empty string', async () => {
    mockReadBody.mockResolvedValue({ name: '' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when description exceeds 500 characters', async () => {
    mockReadBody.mockResolvedValue({ name: 'Valid Name', description: 'x'.repeat(501) })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 500 when the database insert fails', async () => {
    mockReadBody.mockResolvedValue({ name: 'UC Tactics' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'Insert failed' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
