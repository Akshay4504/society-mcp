import { Schema, model } from 'mongoose';
const NoticeSchema = new Schema({
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'General' },
    isPinned: { type: Boolean, default: false },
    targetAudience: { type: String, default: 'All' }
}, { timestamps: true });
export const Notice = model('Notice', NoticeSchema);
//# sourceMappingURL=Notice.js.map