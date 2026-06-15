import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  societyId: Schema.Types.ObjectId | null;
  flatDetails?: {
    block: string;
    flatNumber: string;
    areaSqFt: number;
    occupancyStatus: string;
  };
  isActive: boolean;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', default: null },
  flatDetails: {
    block: { type: String },
    flatNumber: { type: String },
    areaSqFt: { type: Number },
    occupancyStatus: { type: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
