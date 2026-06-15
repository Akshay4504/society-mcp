import { MaintenanceBill } from '../../models/MaintenanceBill.js';
import { MaintenancePayment } from '../../models/MaintenancePayment.js';
export class PaymentRepository {
    async findBills(filter) {
        return MaintenanceBill.find(filter).populate('userId', 'firstName lastName email phone flatDetails');
    }
    async findPayments(filter) {
        return MaintenancePayment.find(filter)
            .populate('userId', 'firstName lastName email phone')
            .populate('billId', 'billingPeriod totalAmount');
    }
    async findBillById(id) {
        return MaintenanceBill.findById(id);
    }
}
//# sourceMappingURL=PaymentRepository.js.map