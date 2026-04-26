import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './index.post'

const mockUser = { sub: 'user-1' }

const DECK_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockCreatedCard = {
  id: 'card-1',
  deck_id: DECK_UUID,
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

const mockReadBody = vi.fn()
const mockEvent = {} as Parameters<typeof handler>[0]

beforeAll(() => {
  vi.stubGlobal('getRouterParam', vi.fn())
  vi.stubGlobal('readBody', mockReadBody)
})
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('POST /api/cards', () => {
  it('creates and returns a new card with FSRS fields initialized', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: mockCreatedCard, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual(mockCreatedCard)
  })

  it('throws 401 when user is not authenticated', async () => {
    vi.mocked(serverSupabaseUser).mockResolvedValue(null)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws 422 when front is missing', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when back is missing', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: 'What is the RX-78-2?' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when front is an empty string', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: '', back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when back is an empty string', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: 'What is the RX-78-2?', back: '' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when deck_id is not a valid UUID', async () => {
    mockReadBody.mockResolvedValue({ deck_id: 'not-a-uuid', front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 422 when front exceeds 2000 characters', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: 'x'.repeat(2001), back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 422 })
  })

  it('throws 500 when the database insert fails', async () => {
    mockReadBody.mockResolvedValue({ deck_id: DECK_UUID, front: 'What is the RX-78-2?', back: 'The original Gundam mobile suit.' })
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { message: 'Insert failed' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
