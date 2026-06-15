import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
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
export const User = model('User', UserSchema);
//# sourceMappingURL=User.js.map