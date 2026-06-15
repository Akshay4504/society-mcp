"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResidentSchema = exports.createResidentSchema = exports.familyMemberSchema = exports.vehicleSchema = void 0;
const zod_1 = require("zod");
exports.vehicleSchema = zod_1.z.object({
    vehicleNumber: zod_1.z.string().regex(/^[A-Z0-9\s-]{4,15}$/, 'Please enter a valid vehicle number').trim(),
    vehicleType: zod_1.z.enum(['2-wheeler', '4-wheeler']),
    parkingSlotNumber: zod_1.z.string().trim()
});
exports.familyMemberSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required').trim(),
    relation: zod_1.z.string().min(1, 'Relation is required').trim(),
    contactNumber: zod_1.z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim().optional()
});
exports.createResidentSchema = zod_1.z.object({
    userId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID reference').trim(),
    societyId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid society ID reference').trim().optional(),
    block: zod_1.z.string().min(1, 'Block identifier is required').trim(),
    flatNumber: zod_1.z.string().min(1, 'Flat number is required').trim(),
    status: zod_1.z.enum(['Active', 'Inactive', 'Suspended']).optional(),
    occupancyType: zod_1.z.enum(['Owner', 'Tenant']),
    moveInDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    moveOutDate: zod_1.z.string().transform((str) => new Date(str)).optional(),
    vehicles: zod_1.z.array(exports.vehicleSchema).optional(),
    familyMembers: zod_1.z.array(exports.familyMemberSchema).optional(),
    emergencyContact: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Emergency contact name is required').trim(),
        relation: zod_1.z.string().min(1, 'Emergency contact relation is required').trim(),
        contactNumber: zod_1.z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid emergency contact phone number').trim()
    })
});
exports.updateResidentSchema = exports.createResidentSchema.partial().omit({ userId: true, societyId: true });
