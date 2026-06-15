import { Response, NextFunction } from 'express';
import { MaintenancePayment } from '../models/MaintenancePayment';
import { MaintenanceBill } from '../models/MaintenanceBill';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

export const createPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { billId, amountPaid, paymentMethod, status, transactionId, receiptUrl, gatewayDetails } = req.body;
    const userId = req.user?.id;
    const societyId = req.user?.societyId;

    if (!userId || !societyId) {
      return next(new AppError('Unauthorized: No user/society association found', 400));
    }

    const bill = await MaintenanceBill.findById(billId);
    if (!bill) {
      return next(new AppError('Maintenance bill not found', 404));
    }

    if (bill.societyId.toString() !== societyId.toString()) {
      return next(new AppError('Unauthorized: Bill belongs to another society', 403));
    }

    const payment = new MaintenancePayment({
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
      } else {
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
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      return next(new AppError('Unauthorized: No associated society', 400));
    }

    const filter: any = { societyId };

    // Residents can only view their own payments
    if (req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') {
      filter.userId = req.user.id;
    } else if (req.query.userId) {
      filter.userId = String(req.query.userId);
    }

    if (req.query.billId) filter.billId = String(req.query.billId);
    if (req.query.status) filter.status = String(req.query.status);

    const payments = await MaintenancePayment.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .populate('billId', 'billingPeriod totalAmount dueDate')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await MaintenancePayment.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('billId', 'billingPeriod totalAmount baseAmount utilityCharges penaltyAmount');

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    // Access control: Resident can only view their own payment. Admin/Staff see all.
    const isOwner = req.user?.id === (payment.userId as any)._id?.toString() || req.user?.id === payment.userId.toString();
    const isAdminOrStaff = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin' || req.user?.role === 'Staff';
    const sameSociety = req.user?.societyId?.toString() === payment.societyId.toString();

    if (!isOwner && (!isAdminOrStaff || !sameSociety)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Admin only
    const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
    if (!isAdmin) {
      return next(new AppError('Forbidden: Only society admins can update payment status', 403));
    }

    const { status, transactionId, receiptUrl } = req.body;
    const payment = await MaintenancePayment.findById(req.params.id);

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    if (payment.societyId.toString() !== req.user?.societyId?.toString()) {
      return next(new AppError('Unauthorized: Payment belongs to another society', 403));
    }

    const previousStatus = payment.status;
    payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (receiptUrl) payment.receiptUrl = receiptUrl;

    await payment.save();

    // If status changed to success, update bill status
    if (status === 'Success' && previousStatus !== 'Success') {
      const bill = await MaintenanceBill.findById(payment.billId);
      if (bill) {
        const remainingAmount = bill.totalAmount - payment.amountPaid;
        if (remainingAmount <= 0) {
          bill.status = 'Paid';
        } else {
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
  } catch (error) {
    next(error);
  }
};
