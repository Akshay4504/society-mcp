import { Schema, model, Document } from 'mongoose';

export interface IMaintenanceBill extends Document {
  societyId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  billingPeriod: string;
  baseAmount: number;
  utilityCharges: number;
  penaltyAmount: number;
  totalAmount: number;
  dueDate: Date;
  status: string;
}

const MaintenanceBillSchema = new Schema<IMaintenanceBill>({
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

export const MaintenanceBill = model<IMaintenanceBill>('MaintenanceBill', MaintenanceBillSchema);
