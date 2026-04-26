import { z } from 'zod'

export const createDeckSchema = z.object({
  name: z.string().min(1, 'Module designation is required.').max(100, 'Designation cannot exceed 100 characters.'),
  description: z.string().max(500, 'Briefing cannot exceed 500 characters.').optional(),
})

export const updateDeckSchema = z.object({
  name: z.string().min(1, 'Module designation is required.').max(100, 'Designation cannot exceed 100 characters.').optional(),
  description: z.string().max(500, 'Briefing cannot exceed 500 characters.').nullable().optional(),
})

export type CreateDeckInput = z.infer<typeof createDeckSchema>
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
