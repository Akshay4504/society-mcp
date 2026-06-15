import { Response, NextFunction } from 'express';
import { Resident } from '../models/Resident';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

export const createResident = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, block, flatNumber, status, occupancyType, moveInDate, moveOutDate, vehicles, familyMembers, emergencyContact } = req.body;
    const societyId = req.user?.societyId;

    if (!societyId) {
      return next(new AppError('Admin user must belong to a society to create residents', 400));
    }

    // Verify user exists and has a resident role
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(new AppError('Target user not found', 404));
    }

    if (targetUser.role !== 'ResidentOwner' && targetUser.role !== 'ResidentTenant') {
      return next(new AppError('User role must be ResidentOwner or ResidentTenant to have a resident profile', 400));
    }

    // Verify user doesn't already have a profile
    const existingProfile = await Resident.findOne({ userId });
    if (existingProfile) {
      return next(new AppError('Resident profile already exists for this user', 400));
    }

    const resident = new Resident({
      userId,
      societyId,
      block,
      flatNumber,
      status: status || 'Active',
      occupancyType,
      moveInDate,
      moveOutDate,
      vehicles: vehicles || [],
      familyMembers: familyMembers || [],
      emergencyContact
    });

    await resident.save();

    // Link flat details back to user for sync consistency
    targetUser.flatDetails = {
      block,
      flatNumber,
      areaSqFt: targetUser.flatDetails?.areaSqFt || 0,
      occupancyStatus: occupancyType === 'Owner' ? 'occupied' : 'rented'
    };
    targetUser.societyId = societyId as any;
    await targetUser.save();

    return res.status(201).json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const getResidents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      return next(new AppError('Unauthorized: No associated society found', 400));
    }

    const filter: any = { societyId };

    if (req.query.block) filter.block = String(req.query.block).toUpperCase();
    if (req.query.flatNumber) filter.flatNumber = String(req.query.flatNumber).toUpperCase();
    if (req.query.status) filter.status = String(req.query.status);

    const residents = await Resident.find(filter)
      .populate('userId', 'firstName lastName email phone')
      .sort({ block: 1, flatNumber: 1 });

    return res.status(200).json({
      success: true,
      count: residents.length,
      data: residents
    });
  } catch (error) {
    next(error);
  }
};

export const getResidentById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const resident = await Resident.findById(req.params.id)
      .populate('userId', 'firstName lastName email phone')
      .populate('societyId', 'name');

    if (!resident) {
      return next(new AppError('Resident profile not found', 404));
    }

    // Access control: Resident can only view their own profile, Admins/Staff can view all in society
    const isOwner = req.user?.id === (resident.userId as any)._id?.toString() || req.user?.id === resident.userId.toString();
    const isAdminOrStaff = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin' || req.user?.role === 'Staff';
    const sameSociety = req.user?.societyId?.toString() === resident.societyId.toString();

    if (!isOwner && (!isAdminOrStaff || !sameSociety)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    return res.status(200).json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const updateResident = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return next(new AppError('Resident profile not found', 404));
    }

    // Access control: Only Admins can modify other resident profiles, a resident can modify their own contact info
    const isOwner = req.user?.id === resident.userId.toString();
    const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
    const sameSociety = req.user?.societyId?.toString() === resident.societyId.toString();

    if (!isAdmin && (!isOwner || !sameSociety)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    // If resident updates, they can only update emergency contacts, family details, and vehicles.
    const fieldsToUpdate = { ...req.body };
    if (!isAdmin) {
      delete fieldsToUpdate.block;
      delete fieldsToUpdate.flatNumber;
      delete fieldsToUpdate.occupancyType;
      delete fieldsToUpdate.status;
      delete fieldsToUpdate.moveInDate;
      delete fieldsToUpdate.moveOutDate;
    }

    Object.assign(resident, fieldsToUpdate);
    await resident.save();

    // Sync back User Flat details if Admin changed flat details
    if (isAdmin && (req.body.block || req.body.flatNumber)) {
      const targetUser = await User.findById(resident.userId);
      if (targetUser) {
        targetUser.flatDetails = {
          block: resident.block,
          flatNumber: resident.flatNumber,
          areaSqFt: targetUser.flatDetails?.areaSqFt || 0,
          occupancyStatus: resident.occupancyType === 'Owner' ? 'occupied' : 'rented'
        };
        await targetUser.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resident profile updated successfully',
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResident = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return next(new AppError('Resident profile not found', 404));
    }

    // Access control: Admin only
    const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
    const sameSociety = req.user?.societyId?.toString() === resident.societyId.toString();

    if (!isAdmin || !sameSociety) {
      return next(new AppError('Forbidden: Only admins can delete profiles', 403));
    }

    await Resident.deleteOne({ _id: resident._id });

    // Sync back User: clear flat details
    const targetUser = await User.findById(resident.userId);
    if (targetUser) {
      targetUser.flatDetails = undefined;
      await targetUser.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Resident profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
