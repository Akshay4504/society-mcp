import { z } from 'zod';

export const vehicleSchema = z.object({
  vehicleNumber: z.string().regex(/^[A-Z0-9\s-]{4,15}$/, 'Please enter a valid vehicle number').trim(),
  vehicleType: z.enum(['2-wheeler', '4-wheeler']),
  parkingSlotNumber: z.string().trim()
});

export const familyMemberSchema = z.object({
  name: z.string().min(2, 'Name is required').trim(),
  relation: z.string().min(1, 'Relation is required').trim(),
  contactNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number').trim().optional()
});

export const createResidentSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID reference').trim(),
  societyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid society ID reference').trim().optional(),
  block: z.string().min(1, 'Block identifier is required').trim(),
  flatNumber: z.string().min(1, 'Flat number is required').trim(),
  status: z.enum(['Active', 'Inactive', 'Suspended']).optional(),
  occupancyType: z.enum(['Owner', 'Tenant']),
  moveInDate: z.string().transform((str) => new Date(str)).optional(),
  moveOutDate: z.string().transform((str) => new Date(str)).optional(),
  vehicles: z.array(vehicleSchema).optional(),
  familyMembers: z.array(familyMemberSchema).optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required').trim(),
    relation: z.string().min(1, 'Emergency contact relation is required').trim(),
    contactNumber: z.string().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid emergency contact phone number').trim()
  })
});

export const updateResidentSchema = createResidentSchema.partial().omit({ userId: true, societyId: true });
