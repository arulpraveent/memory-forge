import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Card ID is required.' })

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.sub)
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    const message = error.code === 'PGRST116' ? 'Data card not found.' : error.message
    throw createError({ statusCode: status, message })
  }
  return data
})
