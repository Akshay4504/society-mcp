import { z } from 'zod';

export const translationSchema = z.object({
  languageCode: z.string().min(2, 'Language code must be at least 2 characters').trim(),
  title: z.string().min(3, 'Translated title is required').trim(),
  content: z.string().min(5, 'Translated content is required').trim()
});

export const createNoticeSchema = z.object({
  title: z.string().min(3, 'Notice title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').trim(),
  content: z.string().min(5, 'Notice content must be at least 5 characters').trim(),
  category: z.enum(['General', 'Financial', 'Emergency', 'Event']).optional(),
  attachments: z.array(z.string().url('Invalid attachment URL format')).optional(),
  translations: z.array(translationSchema).optional(),
  isPinned: z.boolean().optional(),
  targetAudience: z.enum(['All', 'Owners', 'Tenants', 'Staff']).optional(),
  expiresAt: z.string().transform((str) => new Date(str)).optional()
});

export const updateNoticeSchema = createNoticeSchema.partial();
