import { Schema, model, Document } from 'mongoose';

export interface INotice extends Document {
  societyId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  targetAudience: string;
}

const NoticeSchema = new Schema<INotice>({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  isPinned: { type: Boolean, default: false },
  targetAudience: { type: String, default: 'All' }
}, { timestamps: true });

export const Notice = model<INotice>('Notice', NoticeSchema);
