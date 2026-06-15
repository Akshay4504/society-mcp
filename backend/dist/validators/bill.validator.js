"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBillSchema = void 0;
const zod_1 = require("zod");
exports.createBillSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').trim(),
    billingPeriod: zod_1.z.string().trim().min(3, 'Billing period is required'),
    baseAmount: zod_1.z.number().min(0, 'Base amount must be positive'),
    utilityCharges: zod_1.z.number().min(0, 'Utility charges must be positive').optional(),
    penaltyAmount: zod_1.z.number().min(0, 'Penalty amount must be positive').optional(),
    dueDate: zod_1.z.string().or(zod_1.z.date())
});
