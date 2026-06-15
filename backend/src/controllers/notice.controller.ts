import { Response, NextFunction } from 'express';
import { Notice } from '../models/Notice';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

export const createNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, attachments, translations, isPinned, targetAudience, expiresAt } = req.body;
    const societyId = req.user?.societyId;
    const authorId = req.user?.id;

    if (!societyId || !authorId) {
      return next(new AppError('Unauthorized: Author or society missing', 400));
    }

    const notice = new Notice({
      societyId,
      authorId,
      title,
      content,
      category: category || 'General',
      attachments: attachments || [],
      translations: translations || [],
      isPinned: isPinned || false,
      targetAudience: targetAudience || 'All',
      expiresAt
    });

    await notice.save();

    return res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

export const getNotices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      return next(new AppError('Unauthorized: No society association', 400));
    }

    const userRole = req.user?.role;
    const filter: any = {
      societyId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    // Filter by audience
    if (userRole === 'ResidentOwner') {
      filter.targetAudience = { $in: ['All', 'Owners'] };
    } else if (userRole === 'ResidentTenant') {
      filter.targetAudience = { $in: ['All', 'Tenants'] };
    } else if (userRole === 'Staff') {
      filter.targetAudience = { $in: ['All', 'Staff'] };
    } else if (userRole === 'Vendor') {
      filter.targetAudience = 'All';
    }
    // Admins (SuperAdmin, SocietyAdmin) can see all audiences.

    if (req.query.category) {
      filter.category = String(req.query.category);
    }

    const notices = await Notice.find(filter)
      .populate('authorId', 'firstName lastName role')
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

export const getNoticeById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('authorId', 'firstName lastName role');

    if (!notice) {
      return next(new AppError('Notice not found', 404));
    }

    if (notice.societyId.toString() !== req.user?.societyId?.toString()) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    // Role-based target audience check
    const userRole = req.user?.role;
    const isAuthorizedAudience = 
      userRole === 'SuperAdmin' || 
      userRole === 'SocietyAdmin' ||
      notice.targetAudience === 'All' ||
      (userRole === 'ResidentOwner' && notice.targetAudience === 'Owners') ||
      (userRole === 'ResidentTenant' && notice.targetAudience === 'Tenants') ||
      (userRole === 'Staff' && notice.targetAudience === 'Staff');

    if (!isAuthorizedAudience) {
      return next(new AppError('Forbidden: Notice not targeted at your group', 403));
    }

    return res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return next(new AppError('Notice not found', 404));
    }

    // Only Admins or the author can update notices in the same society
    const isAuthor = notice.authorId.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
    const sameSociety = notice.societyId.toString() === req.user?.societyId?.toString();

    if (!sameSociety || (!isAdmin && !isAuthor)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    Object.assign(notice, req.body);
    await notice.save();

    return res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return next(new AppError('Notice not found', 404));
    }

    // Only Admins or the author can delete notices in the same society
    const isAuthor = notice.authorId.toString() === req.user?.id;
    const isAdmin = req.user?.role === 'SuperAdmin' || req.user?.role === 'SocietyAdmin';
    const sameSociety = notice.societyId.toString() === req.user?.societyId?.toString();

    if (!sameSociety || (!isAdmin && !isAuthor)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }

    await Notice.deleteOne({ _id: notice._id });

    return res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
