import { z } from 'zod';
// Helper for MongoDB ObjectId string validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: "Invalid 24-character hex ObjectId layout"
});
// ============================================================================
// 1. Tool: getResident
// ============================================================================
export const GetResidentRequestSchema = z.object({
    block: z.string().min(1, "Block code is required").transform(val => val.toUpperCase()),
    flatNumber: z.string().min(1, "Flat number unit is required").transform(val => val.toUpperCase())
});
export const GetResidentResponseSchema = z.object({
    resident: z.any().nullable(),
    message: z.string().optional()
});
// ============================================================================
// 2. Tool: getPendingPayments
// ============================================================================
export const GetPendingPaymentsRequestSchema = z.object({
    status: z.enum(["Unpaid", "Pending", "Partially-Paid"]).optional(),
    billingPeriod: z.string().optional()
});
export const GetPendingPaymentsResponseSchema = z.object({
    outstandingBillsCount: z.number(),
    outstandingBills: z.array(z.any()),
    pendingReconciliationPaymentsCount: z.number(),
    pendingPayments: z.array(z.any())
});
// ============================================================================
// 3. Tool: registerComplaint
// ============================================================================
export const RegisterComplaintRequestSchema = z.object({
    block: z.string().min(1, "Block code is required").transform(val => val.toUpperCase()),
    flatNumber: z.string().min(1, "Flat number unit is required").transform(val => val.toUpperCase()),
    title: z.string().min(1, "Complaint title cannot be empty"),
    description: z.string().min(1, "Detailed complaint context is required")
});
export const RegisterComplaintResponseSchema = z.object({
    complaint: z.any()
});
// ============================================================================
// 4. Tool: createNotice
// ============================================================================
export const CreateNoticeRequestSchema = z.object({
    title: z.string().min(1, "Notice title cannot be empty"),
    content: z.string().min(1, "Notice bulletin content is required"),
    category: z.enum(["General", "Financial", "Emergency", "Event"]).default("General"),
    targetAudience: z.enum(["All", "Owners", "Tenants", "Staff"]).default("All"),
    isPinned: z.boolean().default(false)
});
export const CreateNoticeResponseSchema = z.object({
    notice: z.any()
});
// ============================================================================
// 5. Tool: generateReport
// ============================================================================
export const GenerateReportRequestSchema = z.object({
    reportType: z.enum(["Collections", "Tickets", "Occupancy"]),
    billingPeriod: z.string().optional()
});
export const GenerateReportResponseSchema = z.object({
    reportType: z.string(),
    summary: z.any()
});
// ============================================================================
// 6. Tool: sendReminder
// ============================================================================
export const SendReminderRequestSchema = z.object({
    residentId: objectIdSchema,
    billId: objectIdSchema,
    customMessage: z.string().optional()
});
export const SendReminderResponseSchema = z.object({
    reminderStatus: z.string(),
    residentName: z.string(),
    emailTarget: z.string(),
    notificationMessage: z.string(),
    invoiceDueDate: z.any(),
    timestamp: z.any()
});
//# sourceMappingURL=toolSchemas.js.map