import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').trim(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim(),
  role: z.enum(['SuperAdmin', 'SocietyAdmin', 'ResidentOwner', 'ResidentTenant', 'Staff', 'Vendor']).optional(),
  societyName: z.string().min(2, 'Society name must be at least 2 characters').optional(),
  adminCode: z.string().optional(),
  flatDetails: z.object({
    block: z.string().trim().optional(),
    flatNumber: z.string().trim().optional(),
    areaSqFt: z.number().min(0).optional(),
    occupancyStatus: z.enum(['occupied', 'vacant', 'rented']).optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
