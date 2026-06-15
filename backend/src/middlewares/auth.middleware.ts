import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'SuperAdmin' | 'SocietyAdmin' | 'ResidentOwner' | 'ResidentTenant' | 'Staff' | 'Vendor';
    societyId: string | null;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization token is missing or malformed', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_society_app';
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      role: 'SuperAdmin' | 'SocietyAdmin' | 'ResidentOwner' | 'ResidentTenant' | 'Staff' | 'Vendor';
      societyId: string | null;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authorization token', 401));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient role clearances', 403));
    }

    next();
  };
};
