import { Schema, model, Document } from 'mongoose';

export interface ISociety extends Document {
  name: string;
  registrationNumber: string;
}

const SocietySchema = new Schema<ISociety>({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

export const Society = model<ISociety>('Society', SocietySchema);
