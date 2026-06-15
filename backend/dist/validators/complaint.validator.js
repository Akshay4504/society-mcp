"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatusSchema = exports.assignComplaintSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').trim(),
    description: zod_1.z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description cannot exceed 2000 characters').trim(),
    images: zod_1.z.array(zod_1.z.string().url('Invalid image URL format')).optional()
});
exports.assignComplaintSchema = zod_1.z.object({
    assignedTo: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee User ID format').trim()
});
exports.updateComplaintStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['Open', 'Assigned', 'In-Progress', 'Resolved', 'Closed']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes cannot exceed 1000 characters').trim().optional(),
    feedbackRating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
    feedbackComments: zod_1.z.string().max(500, 'Feedback comments cannot exceed 500 characters').trim().optional()
});
