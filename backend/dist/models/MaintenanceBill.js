"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceBill = void 0;
const mongoose_1 = require("mongoose");
const MaintenanceBillSchema = new mongoose_1.Schema({
    societyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Society', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
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
exports.MaintenanceBill = (0, mongoose_1.model)('MaintenanceBill', MaintenanceBillSchema);
