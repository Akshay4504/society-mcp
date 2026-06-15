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
  status: 'Unpaid' | 'Paid' | 'Overdue' | 'Partially-Paid';
  paymentGatewayDetails?: {
    orderId: string;
    paymentId?: string;
    signature?: string;
    method?: string;
    paidAt?: Date;
  };
  pdfInvoiceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
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
  status: { 
    type: String, 
    enum: ['Unpaid', 'Paid', 'Overdue', 'Partially-Paid'], 
    default: 'Unpaid' 
  },
  paymentGatewayDetails: {
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
    method: { type: String },
    paidAt: { type: Date }
  },
  pdfInvoiceUrl: { type: String }
}, { timestamps: true });

MaintenanceBillSchema.index({ societyId: 1, userId: 1, billingPeriod: 1 }, { unique: true });
MaintenanceBillSchema.index({ status: 1, dueDate: 1 });

export const MaintenanceBill = model<IMaintenanceBill>('MaintenanceBill', MaintenanceBillSchema);
