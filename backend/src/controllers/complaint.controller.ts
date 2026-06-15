import { Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint';
import { AiService } from '../services/ai.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

export const createComplaint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, images } = req.body;

    if (!req.user || !req.user.societyId) {
      return next(new AppError('User must belong to a housing society to file a complaint', 400));
    }

    // Call AI service to auto-triage
    const aiAnalysis = await AiService.analyzeComplaint(title, description);

    const newComplaint = new Complaint({
      societyId: req.user.societyId,
      raisedBy: req.user.id,
      title,
      description,
      images: images || [],
      status: 'Pending-Approval',
      aiAnalysis
    });

    await newComplaint.save();

    return res.status(201).json({
      success: true,
      data: newComplaint
    });
  } catch (error: any) {
    next(error);
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.societyId) {
      return next(new AppError('Unauthorized access: No associated society', 400));
    }

    let filter: any = { societyId: req.user.societyId };

    // Residents can only see their own tickets, Admins/Staff/Vendors see all tickets in their society
    if (req.user.role === 'ResidentOwner' || req.user.role === 'ResidentTenant') {
      filter.raisedBy = req.user.id;
    } else if (req.user.role === 'Vendor') {
      // Vendors see tickets assigned to them
      filter.assignedTo = req.user.id;
    }

    const complaints = await Complaint.find(filter)
      .populate('raisedBy', 'firstName lastName flatDetails')
      .populate('assignedTo', 'firstName lastName role phone')
      .sort({ createdAt: -1 });

    const processedComplaints = complaints.map(complaint => {
      const compObj = complaint.toObject();
      if (compObj.status !== 'Resolved' && compObj.status !== 'Closed') {
        const diffDays = (Date.now() - new Date(compObj.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
          compObj.aiAnalysis.estimatedPriority = 'Critical';
        }
      }
      return compObj;
    });

    return res.status(200).json({
      success: true,
      count: processedComplaints.length,
      data: processedComplaints
    });
  } catch (error: any) {
    next(error);
  }
};

export const getComplaintById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const complaint = await Complaint.findById(req.params.id)
      .populate('raisedBy', 'firstName lastName phone flatDetails')
      .populate('assignedTo', 'firstName lastName role phone');

    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    // Access control: Ensure user belongs to the same society
    if (complaint.societyId.toString() !== req.user.societyId?.toString()) {
      return next(new AppError('Access denied', 403));
    }

    const compObj = complaint.toObject();
    if (compObj.status !== 'Resolved' && compObj.status !== 'Closed') {
      const diffDays = (Date.now() - new Date(compObj.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        compObj.aiAnalysis.estimatedPriority = 'Critical';
      }
    }

    return res.status(200).json({ success: true, data: compObj });
  } catch (error: any) {
    next(error);
  }
};

export const assignComplaint = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    if (complaint.societyId.toString() !== req.user?.societyId?.toString()) {
      return next(new AppError('Unauthorized: Ticket belongs to another society', 403));
    }

    complaint.assignedTo = new mongoose.Types.ObjectId(assignedTo) as any;
    complaint.status = 'Assigned';
    await complaint.save();

    return res.status(200).json({ success: true, message: 'Complaint assigned successfully', data: complaint });
  } catch (error: any) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, notes, feedbackRating, feedbackComments } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return next(new AppError('Complaint not found', 404));
    }

    if (complaint.societyId.toString() !== req.user?.societyId?.toString()) {
      return next(new AppError('Unauthorized: Ticket belongs to another society', 403));
    }

    if (status) {
      complaint.status = status;
      if (status === 'Resolved' || status === 'Closed') {
        complaint.resolutionDetails = {
          resolvedAt: new Date(),
          notes: notes || 'Resolved by technician.',
          feedbackRating,
          feedbackComments
        };
      }
    }

    await complaint.save();
    return res.status(200).json({ success: true, message: 'Status updated successfully', data: complaint });
  } catch (error: any) {
    next(error);
  }
};
