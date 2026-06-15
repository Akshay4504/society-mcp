import { z } from 'zod';

export const contractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required').trim(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  value: z.number().min(0, 'Contract value cannot be negative'),
  termsDocumentUrl: z.string().url('Invalid terms document URL').trim().optional()
});

export const addRatingSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  review: z.string().max(1000, 'Review cannot exceed 1000 characters').trim().optional()
});

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Vendor name is required').trim(),
  category: z.enum(['Plumbing', 'Electrical', 'Security', 'Gardening', 'Cleaning', 'Other']),
  contactPerson: z.string().min(2, 'Contact person is required').trim(),
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim(),
  status: z.enum(['Active', 'Inactive', 'Blacklisted']).optional(),
  address: z.object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zipCode: z.string().trim().optional()
  }).optional(),
  contracts: z.array(contractSchema).optional()
});

export const updateVendorSchema = createVendorSchema.partial();
