import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '../../../shared/schemas/database.types'
import { createDeckSchema } from '../../../shared/schemas/deck.schemas'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const body = await readBody(event)
  const result = createDeckSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 422, message: result.error.issues[0]!.message })

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('decks')
    .insert({ ...result.data, user_id: user.id })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
