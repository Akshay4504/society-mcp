import { z } from 'zod';

export const createBillSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').trim(),
  billingPeriod: z.string().trim().min(3, 'Billing period is required'),
  baseAmount: z.number().min(0, 'Base amount must be positive'),
  utilityCharges: z.number().min(0, 'Utility charges must be positive').optional(),
  penaltyAmount: z.number().min(0, 'Penalty amount must be positive').optional(),
  dueDate: z.string().or(z.date())
});
