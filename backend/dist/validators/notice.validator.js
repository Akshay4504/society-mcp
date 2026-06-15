"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoticeSchema = exports.createNoticeSchema = exports.translationSchema = void 0;
const zod_1 = require("zod");
exports.translationSchema = zod_1.z.object({
    languageCode: zod_1.z.string().min(2, 'Language code must be at least 2 characters').trim(),
    title: zod_1.z.string().min(3, 'Translated title is required').trim(),
    content: zod_1.z.string().min(5, 'Translated content is required').trim()
});
exports.createNoticeSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Notice title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').trim(),
    content: zod_1.z.string().min(5, 'Notice content must be at least 5 characters').trim(),
    category: zod_1.z.enum(['General', 'Financial', 'Emergency', 'Event']).optional(),
    attachments: zod_1.z.array(zod_1.z.string().url('Invalid attachment URL format')).optional(),
    translations: zod_1.z.array(exports.translationSchema).optional(),
    isPinned: zod_1.z.boolean().optional(),
    targetAudience: zod_1.z.enum(['All', 'Owners', 'Tenants', 'Staff']).optional(),
    expiresAt: zod_1.z.string().transform((str) => new Date(str)).optional()
});
exports.updateNoticeSchema = exports.createNoticeSchema.partial();
