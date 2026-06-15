"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const Society_1 = require("../models/Society");
const RefreshToken_1 = require("../models/RefreshToken");
const MaintenanceBill_1 = require("../models/MaintenanceBill");
const Notice_1 = require("../models/Notice");
const Resident_1 = require("../models/Resident");
const appError_1 = require("../utils/appError");
const signAccessToken = (user) => {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_society_app';
    return jsonwebtoken_1.default.sign({ id: user._id, role: user.role, societyId: user.societyId }, secret, { expiresIn: '15m' });
};
const generateRefreshToken = async (userId) => {
    const token = crypto_1.default.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await RefreshToken_1.RefreshToken.create({
        userId,
        token,
        expiresAt
    });
    return token;
};
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone, role, societyName, flatDetails } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return next(new appError_1.AppError('Email already registered', 400));
        }
        let targetSocietyId = null;
        let isNewSociety = false;
        if (societyName) {
            let society = await Society_1.Society.findOne({ name: societyName });
            if (!society) {
                society = new Society_1.Society({
                    name: societyName,
                    address: { street: 'Main Street', city: 'Metropolis', state: 'NY', zipCode: '10001' },
                    registrationNumber: `REG-${crypto_1.default.randomInt(100000, 999999)}`,
                    contactEmail: 'admin@' + societyName.toLowerCase().replace(/\s/g, '') + '.com',
                    contactPhone: phone
                });
                await society.save();
                isNewSociety = true;
            }
            targetSocietyId = society._id;
        }
        const newUser = new User_1.User({
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
                await Notice_1.Notice.create([
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
                await MaintenanceBill_1.MaintenanceBill.create({
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
                    await Resident_1.Resident.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user || !user.isActive) {
            return next(new appError_1.AppError('Invalid credentials or inactive user', 401));
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return next(new appError_1.AppError('Invalid credentials', 401));
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
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const existingToken = await RefreshToken_1.RefreshToken.findOne({ token: refreshToken });
        if (!existingToken) {
            return next(new appError_1.AppError('Invalid or expired refresh token', 401));
        }
        // Check expiration manually
        if (new Date() > existingToken.expiresAt) {
            await RefreshToken_1.RefreshToken.deleteOne({ _id: existingToken._id });
            return next(new appError_1.AppError('Refresh token has expired', 401));
        }
        const user = await User_1.User.findById(existingToken.userId);
        if (!user || !user.isActive) {
            await RefreshToken_1.RefreshToken.deleteOne({ _id: existingToken._id });
            return next(new appError_1.AppError('User inactive or not found', 401));
        }
        // Refresh token rotation: delete old token
        await RefreshToken_1.RefreshToken.deleteOne({ _id: existingToken._id });
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
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new appError_1.AppError('Refresh token is required for logging out', 400));
        }
        await RefreshToken_1.RefreshToken.deleteOne({ token: refreshToken });
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getProfile = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new appError_1.AppError('Unauthorized', 401));
        const user = await User_1.User.findById(req.user.id).select('-passwordHash');
        if (!user)
            return next(new appError_1.AppError('User not found', 404));
        return res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
