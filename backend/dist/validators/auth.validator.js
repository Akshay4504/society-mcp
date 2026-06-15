"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters').trim(),
    lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters').trim(),
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim(),
    role: zod_1.z.enum(['SuperAdmin', 'SocietyAdmin', 'ResidentOwner', 'ResidentTenant', 'Staff', 'Vendor']).optional(),
    societyName: zod_1.z.string().min(2, 'Society name must be at least 2 characters').optional(),
    flatDetails: zod_1.z.object({
        block: zod_1.z.string().trim().optional(),
        flatNumber: zod_1.z.string().trim().optional(),
        areaSqFt: zod_1.z.number().min(0).optional(),
        occupancyStatus: zod_1.z.enum(['occupied', 'vacant', 'rented']).optional()
    }).optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
