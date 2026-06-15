import { Schema, model } from 'mongoose';
const SocietySchema = new Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true }
}, { timestamps: true });
export const Society = model('Society', SocietySchema);
//# sourceMappingURL=Society.js.map