import { IMaintenanceBill } from '../../models/MaintenanceBill.js';
import { IMaintenancePayment } from '../../models/MaintenancePayment.js';
export interface IPaymentRepository {
    findBills(filter: {
        status?: any;
        billingPeriod?: string;
    }): Promise<IMaintenanceBill[]>;
    findPayments(filter: {
        status?: any;
    }): Promise<IMaintenancePayment[]>;
    findBillById(id: string): Promise<IMaintenanceBill | null>;
}
