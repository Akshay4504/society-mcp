import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { GetPendingPaymentsRequestSchema, GetPendingPaymentsResponseSchema, GetPendingPaymentsResponse } from '../schemas/toolSchemas.js';

export class GetPendingPaymentsService {
  constructor(private paymentRepository: IPaymentRepository) {}

  async execute(input: any): Promise<GetPendingPaymentsResponse> {
    const validatedInput = GetPendingPaymentsRequestSchema.parse(input || {});

    const billFilter: any = {};
    const payFilter: any = {};

    if (validatedInput.status) {
      billFilter.status = validatedInput.status;
      payFilter.status = validatedInput.status;
    } else {
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
