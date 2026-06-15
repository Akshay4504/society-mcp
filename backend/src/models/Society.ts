import { Schema, model, Document } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationNumber: string;
  contactEmail: string;
  contactPhone: string;
  amenities: string[];
  settings: {
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    dueDateDays: number;
    penaltyPercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SocietySchema = new Schema<ISociety>({
  name: { type: String, required: true, trim: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  registrationNumber: { type: String, required: true, unique: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  amenities: [{ type: String }],
  settings: {
    currency: { type: String, default: 'INR' },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annually'], default: 'monthly' },
    dueDateDays: { type: Number, default: 10 },
    penaltyPercentage: { type: Number, default: 2 }
  }
}, { timestamps: true });

export const Society = model<ISociety>('Society', SocietySchema);
