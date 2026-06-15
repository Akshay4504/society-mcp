import { Schema, model } from 'mongoose';
const MaintenancePaymentSchema = new Schema({
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billId: { type: Schema.Types.ObjectId, ref: 'MaintenanceBill', required: true },
    amountPaid: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    transactionId: { type: String, required: true },
    paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });
export const MaintenancePayment = model('MaintenancePayment', MaintenancePaymentSchema);
//# sourceMappingURL=MaintenancePayment.js.map