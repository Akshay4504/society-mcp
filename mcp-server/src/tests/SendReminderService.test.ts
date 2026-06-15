import assert from 'assert';
import { SendReminderService } from '../services/SendReminderService.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';

export async function runSendReminderServiceTests() {
  console.log("Running SendReminderService unit tests...");

  const mockResidentRepo: IResidentRepository = {
    findByUnit: async () => null,
    findById: async (id) => {
      if (id === '6a2e3e03f940063d307cae02') {
        return {
          _id: id,
          userId: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          }
        } as any;
      }
      return null;
    },
    findAll: async () => []
  };

  const mockPaymentRepo: IPaymentRepository = {
    findBills: async () => [],
    findPayments: async () => [],
    findBillById: async (id) => {
      if (id === '6a2e3e03f940063d307cae00') {
        return {
          _id: id,
          totalAmount: 3200,
          billingPeriod: 'June 2026',
          dueDate: new Date("2026-06-24T05:37:07.131Z")
        } as any;
      }
      return null;
    }
  };

  const service = new SendReminderService(mockResidentRepo, mockPaymentRepo);

  // Test Case 1: Successful remind dispatch
  const res = await service.execute({
    residentId: '6a2e3e03f940063d307cae02',
    billId: '6a2e3e03f940063d307cae00',
    customMessage: 'Custom payment warning'
  });

  assert.strictEqual(res.reminderStatus, 'Dispatched');
  assert.strictEqual(res.residentName, 'John Doe');
  assert.strictEqual(res.emailTarget, 'john@example.com');
  assert.strictEqual(res.notificationMessage, 'Custom payment warning');

  // Test Case 2: Resident not found
  try {
    await service.execute({
      residentId: '11223344556677889900aabb',
      billId: '6a2e3e03f940063d307cae00'
    });
    assert.fail("Should have failed for invalid resident");
  } catch (err: any) {
    assert.ok(err.message.includes("Resident ID") && err.message.includes("not found"));
  }

  console.log("✅ SendReminderService unit tests passed!");
}
