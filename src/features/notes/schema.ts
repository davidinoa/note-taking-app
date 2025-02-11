import { z } from 'zod'

export const createFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  content: z
    .string()
    .min(3, 'Content must be at least 3 characters')
    .max(10_000, 'Content must be less than 10,000 characters'),
  tags: z
    .string()
    .optional()
    .transform((str) => (str ? str.split(',').map((tag) => tag.trim()) : [])),
})

export type CreateFormValues = z.infer<typeof createFormSchema>
