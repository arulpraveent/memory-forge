import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createEmptyCard } from 'ts-fsrs'
import type { Database } from '../../../shared/schemas/database.types'
import { createCardSchema } from '../../../shared/schemas/card.schemas'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const body = await readBody(event)
  const result = createCardSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 422, message: result.error.issues[0]!.message })

  const fsrs = createEmptyCard()

  const client = await serverSupabaseClient<Database>(event)
  const { data, error } = await client
    .from('cards')
    .insert({
      ...result.data,
      user_id: user.sub,
      difficulty: fsrs.difficulty,
      due: fsrs.due.toISOString(),
      elapsed_days: fsrs.elapsed_days,
      lapses: fsrs.lapses,
      reps: fsrs.reps,
      scheduled_days: fsrs.scheduled_days,
      stability: fsrs.stability,
      state: fsrs.state,
      last_review: fsrs.last_review ? new Date(fsrs.last_review).toISOString() : null,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
