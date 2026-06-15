"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Society = void 0;
const mongoose_1 = require("mongoose");
const SocietySchema = new mongoose_1.Schema({
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
exports.Society = (0, mongoose_1.model)('Society', SocietySchema);
