import assert from 'assert';
import { GetPendingPaymentsService } from '../services/GetPendingPaymentsService.js';
import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';

export async function runGetPendingPaymentsServiceTests() {
  console.log("Running GetPendingPaymentsService unit tests...");

  const mockPaymentRepo: IPaymentRepository = {
    findBills: async (filter) => {
      return [
        {
          toObject: () => ({ billingPeriod: 'June 2026', totalAmount: 3200, status: 'Unpaid' }),
          billingPeriod: 'June 2026',
          totalAmount: 3200,
          status: 'Unpaid'
        }
      ] as any;
    },
    findPayments: async (filter) => {
      return [] as any;
    },
    findBillById: async (id) => null
  };

  const service = new GetPendingPaymentsService(mockPaymentRepo);

  const res = await service.execute({ status: 'Unpaid' });
  assert.strictEqual(res.outstandingBillsCount, 1);
  assert.strictEqual(res.outstandingBills[0].totalAmount, 3200);
  assert.strictEqual(res.pendingReconciliationPaymentsCount, 0);

  console.log("✅ GetPendingPaymentsService unit tests passed!");
}
