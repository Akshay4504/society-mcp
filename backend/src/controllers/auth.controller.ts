import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { Society } from '../models/Society';
import { RefreshToken } from '../models/RefreshToken';
import { MaintenanceBill } from '../models/MaintenanceBill';
import { Notice } from '../models/Notice';
import { Resident } from '../models/Resident';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';

const signAccessToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_society_app';
  return jwt.sign(
    { id: user._id, role: user.role, societyId: user.societyId },
    secret,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    userId,
    token,
    expiresAt
  });

  return token;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phone, role, societyName, flatDetails, adminCode } = req.body;

    if (role === 'SocietyAdmin') {
      const expectedCode = process.env.ADMIN_SIGNUP_SECRET || 'secret_secretary_passcode_2026';
      if (adminCode !== expectedCode) {
        return next(new AppError('Invalid admin verification code', 400));
      }
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    let targetSocietyId = null;
    let isNewSociety = false;

    if (societyName) {
      let society = await Society.findOne({ name: societyName });
      if (!society) {
        society = new Society({
          name: societyName,
          address: { street: 'Main Street', city: 'Metropolis', state: 'NY', zipCode: '10001' },
          registrationNumber: `REG-${crypto.randomInt(100000, 999999)}`,
          contactEmail: 'admin@' + societyName.toLowerCase().replace(/\s/g, '') + '.com',
          contactPhone: phone
        });
        await society.save();
        isNewSociety = true;
      }
      targetSocietyId = society._id;
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: password, // Pre-save hook hashes this
      phone,
      role: role || 'ResidentOwner',
      societyId: targetSocietyId,
      flatDetails
    });

    await newUser.save();

    // Auto-seed notices and bills for immediate usability
    if (targetSocietyId) {
      // Seed notices if newly created society
      if (isNewSociety) {
        await Notice.create([
          {
            societyId: targetSocietyId,
            authorId: newUser._id,
            title: 'Annual General Body Meeting Scheduled',
            content: 'The Annual General Body Meeting (GBM) for our society is scheduled for June 28th, 2026 at 10:00 AM in the Community Hall. Attendance of all resident owners is requested to discuss maintenance budgets, security measures, and facility upgrades.',
            category: 'General',
            isPinned: true,
            targetAudience: 'All'
          },
          {
            societyId: targetSocietyId,
            authorId: newUser._id,
            title: 'Elevator Service Downtime',
            content: 'Routine elevator servicing will take place on Wednesday, June 17th from 2:00 PM to 4:00 PM. Elevators in Wing A and Wing B will be shut down sequentially. Please plan your commutes accordingly.',
            category: 'Emergency',
            isPinned: false,
            targetAudience: 'All'
          }
        ]);
      }

      // Seed a maintenance bill for this resident user (if applicable)
      if (newUser.role === 'ResidentOwner' || newUser.role === 'ResidentTenant') {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);

        await MaintenanceBill.create({
          societyId: targetSocietyId,
          userId: newUser._id,
          billingPeriod: 'June 2026',
          baseAmount: 2800,
          utilityCharges: 400,
          penaltyAmount: 0,
          totalAmount: 3200,
          dueDate,
          status: 'Unpaid'
        });

        if (flatDetails) {
          await Resident.create({
            userId: newUser._id,
            societyId: targetSocietyId,
            block: flatDetails.block.toUpperCase(),
            flatNumber: flatDetails.flatNumber.toUpperCase(),
            status: 'Active',
            occupancyType: newUser.role === 'ResidentTenant' ? 'Tenant' : 'Owner',
            moveInDate: new Date(),
            vehicles: [],
            familyMembers: [],
            emergencyContact: {
              name: 'Emergency Contact',
              relation: 'Relative',
              contactNumber: phone
            }
          });
        }
      }
    }

    const accessToken = signAccessToken(newUser);
    const refreshToken = await generateRefreshToken(newUser._id.toString());

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          societyId: newUser.societyId,
          flatDetails: newUser.flatDetails
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return next(new AppError('Invalid credentials or inactive user', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    const accessToken = signAccessToken(user);
    const refreshToken = await generateRefreshToken(user._id.toString());

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          societyId: user.societyId,
          flatDetails: user.flatDetails
        }
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const existingToken = await RefreshToken.findOne({ token: refreshToken });
    if (!existingToken) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Check expiration manually
    if (new Date() > existingToken.expiresAt) {
      await RefreshToken.deleteOne({ _id: existingToken._id });
      return next(new AppError('Refresh token has expired', 401));
    }

    const user = await User.findById(existingToken.userId);
    if (!user || !user.isActive) {
      await RefreshToken.deleteOne({ _id: existingToken._id });
      return next(new AppError('User inactive or not found', 401));
    }

    // Refresh token rotation: delete old token
    await RefreshToken.deleteOne({ _id: existingToken._id });

    // Issue new access and refresh tokens
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Refresh token is required for logging out', 400));
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('Unauthorized', 401));

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    next(error);
  }
};
