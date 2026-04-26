import { z } from 'zod'

export const createCardSchema = z.object({
  deck_id: z.string().uuid('Invalid deck ID.'),
  front: z.string().min(1, 'Front side content is required.').max(2000, 'Front content cannot exceed 2000 characters.'),
  back: z.string().min(1, 'Back side content is required.').max(2000, 'Back content cannot exceed 2000 characters.'),
})

export const updateCardSchema = z.object({
  front: z.string().min(1, 'Front side content is required.').max(2000, 'Front content cannot exceed 2000 characters.').optional(),
  back: z.string().min(1, 'Back side content is required.').max(2000, 'Back content cannot exceed 2000 characters.').optional(),
})

export const reviewCardSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 4.').max(4, 'Rating must be between 1 and 4.'),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type ReviewCardInput = z.infer<typeof reviewCardSchema>
