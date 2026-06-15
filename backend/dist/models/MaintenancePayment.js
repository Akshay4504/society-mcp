"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenancePayment = void 0;
const mongoose_1 = require("mongoose");
const MaintenancePaymentSchema = new mongoose_1.Schema({
    societyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Society',
        required: [true, 'Society ID reference is required']
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID reference is required']
    },
    billId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MaintenanceBill',
        required: [true, 'Maintenance Bill ID reference is required']
    },
    amountPaid: {
        type: Number,
        required: [true, 'Amount paid is required'],
        min: [0, 'Amount paid cannot be negative']
    },
    paymentDate: {
        type: Date,
        required: [true, 'Payment date is required'],
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['Card', 'UPI', 'NetBanking', 'Cash', 'Cheque'],
            message: '{VALUE} is not a valid payment method'
        },
        required: [true, 'Payment method is required']
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Success', 'Failed', 'Refunded'],
            message: '{VALUE} is not a valid payment status'
        },
        default: 'Pending'
    },
    transactionId: {
        type: String,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { transactionId: { $type: 'string' } }
        }
    },
    receiptUrl: {
        type: String,
        trim: true,
        match: [
            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
            'Please enter a valid URL for the receipt'
        ]
    },
    gatewayDetails: {
        type: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for query optimization
MaintenancePaymentSchema.index({ societyId: 1 });
MaintenancePaymentSchema.index({ userId: 1 });
MaintenancePaymentSchema.index({ billId: 1 });
MaintenancePaymentSchema.index({ status: 1, paymentDate: -1 });
exports.MaintenancePayment = (0, mongoose_1.model)('MaintenancePayment', MaintenancePaymentSchema);
