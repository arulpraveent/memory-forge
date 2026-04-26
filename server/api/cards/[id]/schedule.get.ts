import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { fsrs, Rating } from 'ts-fsrs'
import type { Database } from '../../../../shared/schemas/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Card ID is required.' })

  const client = await serverSupabaseClient<Database>(event)

  const { data: card, error: fetchError } = await client
    .from('cards')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.sub)
    .single()

  if (fetchError) {
    const status = fetchError.code === 'PGRST116' ? 404 : 500
    const message = fetchError.code === 'PGRST116' ? 'Data card not found.' : fetchError.message
    throw createError({ statusCode: status, message })
  }

  const scheduler = fsrs()
  const now = new Date()

  const fsrsCard = {
    due: new Date(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }

  const scheduling = scheduler.repeat(fsrsCard, now)

  return {
    [Rating.Again]: scheduling[Rating.Again]!.card.due.toISOString(),
    [Rating.Hard]: scheduling[Rating.Hard]!.card.due.toISOString(),
    [Rating.Good]: scheduling[Rating.Good]!.card.due.toISOString(),
    [Rating.Easy]: scheduling[Rating.Easy]!.card.due.toISOString(),
  }
})
