"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillById = exports.getBills = exports.createBill = void 0;
const MaintenanceBill_1 = require("../models/MaintenanceBill");
const appError_1 = require("../utils/appError");
const createBill = async (req, res, next) => {
    try {
        const { userId, billingPeriod, baseAmount, utilityCharges, penaltyAmount, dueDate } = req.body;
        const societyId = req.user?.societyId;
        if (!societyId) {
            return next(new appError_1.AppError('Unauthorized: No housing society association', 400));
        }
        const totalAmount = (baseAmount || 0) + (utilityCharges || 0) + (penaltyAmount || 0);
        const newBill = new MaintenanceBill_1.MaintenanceBill({
            societyId,
            userId,
            billingPeriod,
            baseAmount,
            utilityCharges: utilityCharges || 0,
            penaltyAmount: penaltyAmount || 0,
            totalAmount,
            dueDate: new Date(dueDate),
            status: 'Unpaid'
        });
        await newBill.save();
        return res.status(201).json({
            success: true,
            data: newBill
        });
    }
    catch (error) {
        // Handle duplicate key error for { societyId, userId, billingPeriod }
        if (error.code === 11000) {
            return next(new appError_1.AppError('A bill already exists for this resident and billing period.', 400));
        }
        next(error);
    }
};
exports.createBill = createBill;
const getBills = async (req, res, next) => {
    try {
        const societyId = req.user?.societyId;
        if (!societyId) {
            return next(new appError_1.AppError('Unauthorized: No associated society', 400));
        }
        const filter = { societyId };
        // Residents can only see their own bills
        if (req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') {
            filter.userId = req.user.id;
        }
        else if (req.query.userId) {
            filter.userId = String(req.query.userId);
        }
        if (req.query.status) {
            filter.status = String(req.query.status);
        }
        const bills = await MaintenanceBill_1.MaintenanceBill.find(filter)
            .populate('userId', 'firstName lastName email phone flatDetails')
            .sort({ dueDate: -1 });
        return res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBills = getBills;
const getBillById = async (req, res, next) => {
    try {
        const bill = await MaintenanceBill_1.MaintenanceBill.findById(req.params.id).populate('userId', 'firstName lastName email phone flatDetails');
        if (!bill) {
            return next(new appError_1.AppError('Bill not found', 404));
        }
        if (bill.societyId.toString() !== req.user?.societyId?.toString()) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        // Residents can only access their own bills
        if ((req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') && bill.userId.toString() !== req.user.id) {
            return next(new appError_1.AppError('Forbidden: Access denied', 403));
        }
        return res.status(200).json({
            success: true,
            data: bill
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBillById = getBillById;
