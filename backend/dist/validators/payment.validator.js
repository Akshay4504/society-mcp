"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    billId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid bill ID reference').trim(),
    amountPaid: zod_1.z.number().min(0, 'Amount paid must be a positive number'),
    paymentMethod: zod_1.z.enum(['Card', 'UPI', 'NetBanking', 'Cash', 'Cheque']),
    status: zod_1.z.enum(['Pending', 'Success', 'Failed', 'Refunded']).optional(),
    transactionId: zod_1.z.string().trim().optional(),
    receiptUrl: zod_1.z.string().url('Invalid receipt URL format').trim().optional(),
    gatewayDetails: zod_1.z.record(zod_1.z.any()).optional()
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Pending', 'Success', 'Failed', 'Refunded']),
    transactionId: zod_1.z.string().trim().optional(),
    receiptUrl: zod_1.z.string().url('Invalid receipt URL format').trim().optional()
});
