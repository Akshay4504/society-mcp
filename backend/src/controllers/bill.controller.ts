import { Request, Response, NextFunction } from 'express';
import { MaintenanceBill } from '../models/MaintenanceBill';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

export const createBill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, billingPeriod, baseAmount, utilityCharges, penaltyAmount, dueDate } = req.body;
    const societyId = req.user?.societyId;

    if (!societyId) {
      return next(new AppError('Unauthorized: No housing society association', 400));
    }

    const totalAmount = (baseAmount || 0) + (utilityCharges || 0) + (penaltyAmount || 0);

    const newBill = new MaintenanceBill({
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
  } catch (error: any) {
    // Handle duplicate key error for { societyId, userId, billingPeriod }
    if (error.code === 11000) {
      return next(new AppError('A bill already exists for this resident and billing period.', 400));
    }
    next(error);
  }
};

export const getBills = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      return next(new AppError('Unauthorized: No associated society', 400));
    }

    const filter: any = { societyId };

    // Residents can only see their own bills
    if (req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') {
      filter.userId = req.user.id;
    } else if (req.query.userId) {
      filter.userId = String(req.query.userId);
    }

    if (req.query.status) {
      filter.status = String(req.query.status);
    }

    const bills = await MaintenanceBill.find(filter)
      .populate('userId', 'firstName lastName email phone flatDetails')
      .sort({ dueDate: -1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const bill = await MaintenanceBill.findById(req.params.id).populate('userId', 'firstName lastName email phone flatDetails');
    if (!bill) {
      return next(new AppError('Bill not found', 404));
    }

    if (bill.societyId.toString() !== req.user?.societyId?.toString()) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    // Residents can only access their own bills
    if ((req.user?.role === 'ResidentOwner' || req.user?.role === 'ResidentTenant') && bill.userId.toString() !== req.user.id) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    return res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    next(error);
  }
};
