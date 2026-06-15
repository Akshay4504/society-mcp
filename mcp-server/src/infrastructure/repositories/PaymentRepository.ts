import { IPaymentRepository } from '../../domain/repositories/PaymentRepository.interface.js';
import { MaintenanceBill, IMaintenanceBill } from '../../models/MaintenanceBill.js';
import { MaintenancePayment, IMaintenancePayment } from '../../models/MaintenancePayment.js';

export class PaymentRepository implements IPaymentRepository {
  async findBills(filter: { status?: any; billingPeriod?: string }): Promise<IMaintenanceBill[]> {
    return MaintenanceBill.find(filter).populate('userId', 'firstName lastName email phone flatDetails');
  }

  async findPayments(filter: { status?: any }): Promise<IMaintenancePayment[]> {
    return MaintenancePayment.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('billId', 'billingPeriod totalAmount');
  }

  async findBillById(id: string): Promise<IMaintenanceBill | null> {
    return MaintenanceBill.findById(id);
  }
}
