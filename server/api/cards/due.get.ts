import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const { deck_id } = getQuery(event)

  const client = await serverSupabaseClient<Database>(event)
  let query = client
    .from('cards')
    .select('*')
    .eq('user_id', user.sub)
    .lte('due', new Date().toISOString())
    .order('due', { ascending: true })

  if (deck_id && typeof deck_id === 'string') {
    query = query.eq('deck_id', deck_id)
  }

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
