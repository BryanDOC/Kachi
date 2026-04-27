import { z } from 'zod';

export const fixedExpenseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency_id: z.string().min(1, 'Selecciona una moneda'),
  category_id: z.string().nullable(),
  billing_day: z.number().min(1).max(31).nullable(),
  notes: z.string().nullable(),
});

export type FixedExpenseFormData = z.infer<typeof fixedExpenseSchema>;
