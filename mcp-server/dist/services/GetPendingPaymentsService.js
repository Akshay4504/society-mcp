import { GetPendingPaymentsRequestSchema, GetPendingPaymentsResponseSchema } from '../schemas/toolSchemas.js';
export class GetPendingPaymentsService {
    paymentRepository;
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async execute(input) {
        const validatedInput = GetPendingPaymentsRequestSchema.parse(input || {});
        const billFilter = {};
        const payFilter = {};
        if (validatedInput.status) {
            billFilter.status = validatedInput.status;
            payFilter.status = validatedInput.status;
        }
        else {
            billFilter.status = { $in: ['Unpaid', 'Partially-Paid'] };
            payFilter.status = 'Pending';
        }
        if (validatedInput.billingPeriod) {
            billFilter.billingPeriod = validatedInput.billingPeriod;
        }
        const [bills, payments] = await Promise.all([
            this.paymentRepository.findBills(billFilter),
            this.paymentRepository.findPayments(payFilter)
        ]);
        const result = {
            outstandingBillsCount: bills.length,
            outstandingBills: bills.map(b => b.toObject ? b.toObject() : b),
            pendingReconciliationPaymentsCount: payments.length,
            pendingPayments: payments.map(p => p.toObject ? p.toObject() : p)
        };
        return GetPendingPaymentsResponseSchema.parse(result);
    }
}
//# sourceMappingURL=GetPendingPaymentsService.js.map