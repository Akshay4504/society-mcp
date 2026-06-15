import { z } from 'zod';

export const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters').trim(),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description cannot exceed 2000 characters').trim(),
  images: z.array(z.string().url('Invalid image URL format')).optional()
});

export const assignComplaintSchema = z.object({
  assignedTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignee User ID format').trim()
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Pending-Approval', 'Open', 'Assigned', 'In-Progress', 'Resolved', 'Closed']).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').trim().optional(),
  feedbackRating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').optional(),
  feedbackComments: z.string().max(500, 'Feedback comments cannot exceed 500 characters').trim().optional()
});
