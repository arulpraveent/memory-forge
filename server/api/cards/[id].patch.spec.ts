import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './[id].patch'

const mockUser = { sub: 'user-1' }

const mockUpdatedCard = {
  id: 'card-1',
  deck_id: 'deck-1',
  user_id: 'user-1',
  front: 'Updated front',
  back: 'Updated back',
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

describe('PATCH /api/cards/:id', () => {
  it('updates and returns the card with a new front', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    mockReadBody.mockResolvedValue({ front: 'Updated front' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockUpdatedCard, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockUpdatedCard)
  })

  it('updates and returns the card with a new back', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    mockReadBody.mockResolvedValue({ back: 'Updated back' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockUpdatedCard, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toMatchObject({ back: 'Updated back' })
  })

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

  it('throws 422 when front is an empty string', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    mockReadBody.mockResolvedValue({ front: '' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when back is an empty string', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    mockReadBody.mockResolvedValue({ back: '' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 404 when card is not found (PGRST116)', async () => {
    mockGetRouterParam.mockReturnValue('nonexistent-id')
    mockReadBody.mockResolvedValue({ front: 'Updated front' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 500 on other database errors', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    mockReadBody.mockResolvedValue({ front: 'Updated front' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: '23505', message: 'Unique violation' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
