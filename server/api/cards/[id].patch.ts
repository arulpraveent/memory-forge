import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'
import { updateCardSchema } from '../../../shared/schemas/card.schemas'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Card ID is required.' })

  const body = await readBody(event)
  const result = updateCardSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 422, message: result.error.issues[0]!.message })

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('cards')
    .update({ ...result.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.sub)
    .select()
    .single()

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500
    const message = error.code === 'PGRST116' ? 'Data card not found.' : error.message
    throw createError({ statusCode: status, message })
  }
  return data
})
