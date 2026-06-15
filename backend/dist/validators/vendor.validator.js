"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorSchema = exports.createVendorSchema = exports.addRatingSchema = exports.contractSchema = void 0;
const zod_1 = require("zod");
exports.contractSchema = zod_1.z.object({
    contractNumber: zod_1.z.string().min(1, 'Contract number is required').trim(),
    startDate: zod_1.z.string().transform((str) => new Date(str)),
    endDate: zod_1.z.string().transform((str) => new Date(str)),
    value: zod_1.z.number().min(0, 'Contract value cannot be negative'),
    termsDocumentUrl: zod_1.z.string().url('Invalid terms document URL').trim().optional()
});
exports.addRatingSchema = zod_1.z.object({
    rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    review: zod_1.z.string().max(1000, 'Review cannot exceed 1000 characters').trim().optional()
});
exports.createVendorSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Vendor name is required').trim(),
    category: zod_1.z.enum(['Plumbing', 'Electrical', 'Security', 'Gardening', 'Cleaning', 'Other']),
    contactPerson: zod_1.z.string().min(2, 'Contact person is required').trim(),
    email: zod_1.z.string().email('Please enter a valid email address').toLowerCase().trim(),
    phone: zod_1.z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim(),
    status: zod_1.z.enum(['Active', 'Inactive', 'Blacklisted']).optional(),
    address: zod_1.z.object({
        street: zod_1.z.string().trim().optional(),
        city: zod_1.z.string().trim().optional(),
        state: zod_1.z.string().trim().optional(),
        zipCode: zod_1.z.string().trim().optional()
    }).optional(),
    contracts: zod_1.z.array(exports.contractSchema).optional()
});
exports.updateVendorSchema = exports.createVendorSchema.partial();
