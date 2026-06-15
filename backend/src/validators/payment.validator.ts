import { z } from 'zod';

export const createPaymentSchema = z.object({
  billId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bill ID reference').trim(),
  amountPaid: z.number().min(0, 'Amount paid must be a positive number'),
  paymentMethod: z.enum(['Card', 'UPI', 'NetBanking', 'Cash', 'Cheque']),
  status: z.enum(['Pending', 'Success', 'Failed', 'Refunded']).optional(),
  transactionId: z.string().trim().optional(),
  receiptUrl: z.string().url('Invalid receipt URL format').trim().optional(),
  gatewayDetails: z.record(z.any()).optional()
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['Pending', 'Success', 'Failed', 'Refunded']),
  transactionId: z.string().trim().optional(),
  receiptUrl: z.string().url('Invalid receipt URL format').trim().optional()
});
