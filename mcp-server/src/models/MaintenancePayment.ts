import { Schema, model, Document } from 'mongoose';

export interface IMaintenancePayment extends Document {
  societyId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  billId: Schema.Types.ObjectId;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  transactionId: string;
  paymentDate: Date;
}

const MaintenancePaymentSchema = new Schema<IMaintenancePayment>({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  billId: { type: Schema.Types.ObjectId, ref: 'MaintenanceBill', required: true },
  amountPaid: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  transactionId: { type: String, required: true },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

export const MaintenancePayment = model<IMaintenancePayment>('MaintenancePayment', MaintenancePaymentSchema);
