"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.getPaymentById = exports.getPayments = exports.createPayment = void 0;
const MaintenancePayment_1 = require("../models/MaintenancePayment");
const MaintenanceBill_1 = require("../models/MaintenanceBill");
const appError_1 = require("../utils/appError");
const createPayment = async (req, res, next) => {
    try {
        const { billId, amountPaid, paymentMethod, status, transactionId, receiptUrl, gatewayDetails } = req.body;
        const userId = req.user?.id;
        const societyId = req.user?.societyId;
        if (!userId || !societyId) {
            return next(new appError_1.AppError('Unauthorized: No user/society association found', 400));
        }
        const bill = await MaintenanceBill_1.MaintenanceBill.findById(billId);
        if (!bill) {
            return next(new appError_1.AppError('Maintenance bill not found', 404));
        }
        if (bill.societyId.toString() !== societyId.toString()) {
            return next(new appError_1.AppError('Unauthorized: Bill belongs to another society', 403));
        }
        const payment = new MaintenancePayment_1.MaintenancePayment({
            societyId,
            userId,
            billId,
            amountPaid,
            paymentMethod,
            status: status || 'Pending',
            transactionId,
            receiptUrl,
            gatewayDetails
        });
        await payment.save();
        // If payment is marked successful, update bill status
        if (status === 'Success') {
            const remainingAmount = bill.totalAmount - amountPaid;
            if (remainingAmount <= 0) {
                bill.status = 'Paid';
            }
            else {
                bill.status = 'Partially-Paid';
            }
            if (bill.paymentGatewayDetails) {
                bill.paymentGatewayDetails.paymentId = transactionId;
                bill.paymentGatewayDetails.paidAt = new Date();
                bill.paymentGatewayDetails.method = paymentMethod;
            }
            await bill.save();
        }
        return res.status(201).json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPayment = createPayment;
const getPayments = async (req, res, next) => {
    try {
        const societyId = req.user?.societyId;
        if (!societyId) {
            return next(new appError_1.AppError('Unauthorized: No associated society', 400));
        }
        const filter = { societyId };
        // Residents can only view their own payments
        if (req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') {
            filter.userId = req.user.id;
        }
        else if (req.query.userId) {
            filter.userId = String(req.query.userId);
        }
        if (req.query.billId)
            filter.billId = String(req.query.billId);
        if (req.query.status)
            filter.status = String(req.query.status);
        const payments = await MaintenancePayment_1.MaintenancePayment.find(filter)
            .populate('userId', 'firstName lastName email phone')
            .populate('billId', 'billingPeriod totalAmount dueDate')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPayments = getPayments;
const getPaymentById = async (req, res, next) => {
    try {
        const payment = await MaintenancePayment_1.MaintenancePayment.findById(req.params.id)
            .populate('userId', 'firstName lastName email phone')
            .populate('billId', 'billingPeriod totalAmount baseAmount utilityCharges penaltyAmount');
        if (!payment) {
            return next(new appError_1.AppError('Payment record not found', 404));
        }
        // Access control: Resident can only view their own payment. Admin/Staff see all.
        const isOwner = req.user?.id === payment.userId._id?.toString() || req.user?.id === payment.userId.toString();
        const isAdminOrStaff = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin' || req.user?.role === 'Staff';
        const sameSociety = req.user?.societyId?.toString() === payment.societyId.toString();
        if (!isOwner && (!isAdminOrStaff || !sameSociety)) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        return res.status(200).json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentById = getPaymentById;
const updatePaymentStatus = async (req, res, next) => {
    try {
        // Admin only
        const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
        if (!isAdmin) {
            return next(new appError_1.AppError('Forbidden: Only society admins can update payment status', 403));
        }
        const { status, transactionId, receiptUrl } = req.body;
        const payment = await MaintenancePayment_1.MaintenancePayment.findById(req.params.id);
        if (!payment) {
            return next(new appError_1.AppError('Payment record not found', 404));
        }
        if (payment.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Unauthorized: Payment belongs to another society', 403));
        }
        const previousStatus = payment.status;
        payment.status = status;
        if (transactionId)
            payment.transactionId = transactionId;
        if (receiptUrl)
            payment.receiptUrl = receiptUrl;
        await payment.save();
        // If status changed to success, update bill status
        if (status === 'Success' && previousStatus !== 'Success') {
            const bill = await MaintenanceBill_1.MaintenanceBill.findById(payment.billId);
            if (bill) {
                const remainingAmount = bill.totalAmount - payment.amountPaid;
                if (remainingAmount <= 0) {
                    bill.status = 'Paid';
                }
                else {
                    bill.status = 'Partially-Paid';
                }
                if (bill.paymentGatewayDetails) {
                    bill.paymentGatewayDetails.paymentId = transactionId || payment.transactionId;
                    bill.paymentGatewayDetails.paidAt = new Date();
                    bill.paymentGatewayDetails.method = payment.paymentMethod;
                }
                await bill.save();
            }
        }
        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: payment
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
