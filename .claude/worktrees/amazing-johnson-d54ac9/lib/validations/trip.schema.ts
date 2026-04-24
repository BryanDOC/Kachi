import { z } from 'zod';

export const tripSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  status: z.enum(['active', 'completed', 'cancelled']),
});

export type TripFormData = z.infer<typeof tripSchema>;
