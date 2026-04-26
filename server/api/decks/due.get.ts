import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('decks')
    .select('*, cards!inner(count)')
    .lte('cards.due', new Date().toISOString())
    .order('updated_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data.map(({ cards, ...deck }) => ({
    ...deck,
    due_count: (cards as unknown as { count: number }[])[0]?.count ?? 0,
  }))
})
