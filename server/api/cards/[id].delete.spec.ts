import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import handler from './[id].delete'

const mockUser = { sub: 'user-1' }

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

beforeAll(() => { vi.stubGlobal('getRouterParam', mockGetRouterParam) })
afterAll(() => { vi.unstubAllGlobals() })
afterEach(() => { vi.clearAllMocks() })

describe('DELETE /api/cards/:id', () => {
  it('returns { success: true } on successful deletion', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(createClient({ data: null, error: null }) as never)

    const result = await handler(mockEvent)

    expect(result).toEqual({ success: true })
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

  it('throws 404 when card is not found (PGRST116)', async () => {
    mockGetRouterParam.mockReturnValue('nonexistent-id')
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: 'PGRST116', message: 'No rows found' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 404 })
  })

  it('throws 500 on other database errors', async () => {
    mockGetRouterParam.mockReturnValue('card-1')
    vi.mocked(serverSupabaseUser).mockResolvedValue(mockUser as never)
    vi.mocked(serverSupabaseClient).mockResolvedValue(
      createClient({ data: null, error: { code: '23503', message: 'Foreign key violation' } }) as never,
    )

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})
