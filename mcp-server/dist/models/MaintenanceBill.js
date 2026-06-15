import { Schema, model } from 'mongoose';
const MaintenanceBillSchema = new Schema({
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    billingPeriod: { type: String, required: true },
    baseAmount: { type: Number, required: true },
    utilityCharges: { type: Number, default: 0 },
    penaltyAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, default: 'Unpaid' }
}, { timestamps: true });
export const MaintenanceBill = model('MaintenanceBill', MaintenanceBillSchema);
//# sourceMappingURL=MaintenanceBill.js.map