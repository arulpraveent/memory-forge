import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Module ID is required.' })

  const client = await serverSupabaseClient<Database>(event)
  const { error } = await client
    .from('decks')
    .delete()
    .eq('id', id)

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    const message = error.code === 'PGRST116' ? 'Data module not found.' : error.message
    throw createError({ statusCode: status, message })
  }
  return { success: true }
})
