import { Schema, model, Document } from 'mongoose';

export interface IComplaint extends Document {
  societyId: Schema.Types.ObjectId;
  raisedBy: Schema.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  status: string;
  assignedTo?: Schema.Types.ObjectId;
  aiAnalysis: {
    detectedCategory: string;
    confidenceScore: number;
    estimatedPriority: string;
    sentimentScore: number;
    explanation: string;
  };
}

const ComplaintSchema = new Schema<IComplaint>({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, default: 'Open' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  aiAnalysis: {
    detectedCategory: { type: String, required: true },
    confidenceScore: { type: Number, required: true, default: 1.0 },
    estimatedPriority: { type: String, required: true, default: 'Medium' },
    sentimentScore: { type: Number, required: true, default: 0.0 },
    explanation: { type: String }
  }
}, { timestamps: true });

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
