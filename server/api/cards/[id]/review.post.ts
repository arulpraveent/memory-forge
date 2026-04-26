import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { fsrs, Rating } from 'ts-fsrs'
import type { Database } from '../../../../shared/schemas/database.types'
import { reviewCardSchema } from '../../../../shared/schemas/card.schemas'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized. Access denied.' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Card ID is required.' })

  const body = await readBody(event)
  const result = reviewCardSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 422, message: result.error.issues[0]!.message })

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
  const rating = result.data.rating as Rating
  const { card: updatedFsrsCard, log } = scheduling[rating]!

  const { data: updatedCard, error: updateError } = await client
    .from('cards')
    .update({
      difficulty: updatedFsrsCard.difficulty,
      due: updatedFsrsCard.due.toISOString(),
      elapsed_days: updatedFsrsCard.elapsed_days,
      lapses: updatedFsrsCard.lapses,
      reps: updatedFsrsCard.reps,
      scheduled_days: updatedFsrsCard.scheduled_days,
      stability: updatedFsrsCard.stability,
      state: updatedFsrsCard.state,
      last_review: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw createError({ statusCode: 500, message: updateError.message })

  const { error: logError } = await client
    .from('review_logs')
    .insert({
      card_id: id,
      user_id: user.sub,
      rating,
      difficulty: log.difficulty,
      due: log.due.toISOString(),
      elapsed_days: log.elapsed_days,
      last_elapsed_days: log.last_elapsed_days,
      scheduled_days: log.scheduled_days,
      stability: log.stability,
      state: log.state,
      review: log.review.toISOString(),
      catch_up: null,
    })

  if (logError) throw createError({ statusCode: 500, message: logError.message })

  return updatedCard
})
