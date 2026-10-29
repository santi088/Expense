import {z} from 'zod';

export const ExpenseInput = z.object({
  category_id: z.number().positive().int(),
  amount: z.number().int().positive(),
  spent_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
}).strict();

export const CategoryInput = z.object({
  name: z.string().min(3).max(50)
})

export const ParamsInput = z.object({
  id: z.number().int().positive()
})

const Partial = ExpenseInput.partial()
export type Expense = z.infer<typeof ExpenseInput>
export type PartialExpense = z.infer<typeof Partial>
