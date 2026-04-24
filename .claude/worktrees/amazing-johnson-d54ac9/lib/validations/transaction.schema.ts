import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency_id: z.string().min(1, 'Selecciona una moneda'),
  category_id: z.string().nullable(),
  subcategory_id: z.string().nullable(),
  trip_id: z.string().nullable(),
  description: z.string().min(1, 'La descripción es requerida'),
  date: z.string(),
  notes: z.string().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
