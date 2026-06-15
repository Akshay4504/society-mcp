import { z } from 'zod';
export declare const GetResidentRequestSchema: z.ZodObject<{
    block: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    flatNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strip>;
export type GetResidentRequest = z.infer<typeof GetResidentRequestSchema>;
export declare const GetResidentResponseSchema: z.ZodObject<{
    resident: z.ZodNullable<z.ZodAny>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetResidentResponse = z.infer<typeof GetResidentResponseSchema>;
export declare const GetPendingPaymentsRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        Unpaid: "Unpaid";
        Pending: "Pending";
        "Partially-Paid": "Partially-Paid";
    }>>;
    billingPeriod: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GetPendingPaymentsRequest = z.infer<typeof GetPendingPaymentsRequestSchema>;
export declare const GetPendingPaymentsResponseSchema: z.ZodObject<{
    outstandingBillsCount: z.ZodNumber;
    outstandingBills: z.ZodArray<z.ZodAny>;
    pendingReconciliationPaymentsCount: z.ZodNumber;
    pendingPayments: z.ZodArray<z.ZodAny>;
}, z.core.$strip>;
export type GetPendingPaymentsResponse = z.infer<typeof GetPendingPaymentsResponseSchema>;
export declare const RegisterComplaintRequestSchema: z.ZodObject<{
    block: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    flatNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    title: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
export type RegisterComplaintRequest = z.infer<typeof RegisterComplaintRequestSchema>;
export declare const RegisterComplaintResponseSchema: z.ZodObject<{
    complaint: z.ZodAny;
}, z.core.$strip>;
export type RegisterComplaintResponse = z.infer<typeof RegisterComplaintResponseSchema>;
export declare const CreateNoticeRequestSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    category: z.ZodDefault<z.ZodEnum<{
        General: "General";
        Financial: "Financial";
        Emergency: "Emergency";
        Event: "Event";
    }>>;
    targetAudience: z.ZodDefault<z.ZodEnum<{
        All: "All";
        Owners: "Owners";
        Tenants: "Tenants";
        Staff: "Staff";
    }>>;
    isPinned: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateNoticeRequest = z.infer<typeof CreateNoticeRequestSchema>;
export declare const CreateNoticeResponseSchema: z.ZodObject<{
    notice: z.ZodAny;
}, z.core.$strip>;
export type CreateNoticeResponse = z.infer<typeof CreateNoticeResponseSchema>;
export declare const GenerateReportRequestSchema: z.ZodObject<{
    reportType: z.ZodEnum<{
        Collections: "Collections";
        Tickets: "Tickets";
        Occupancy: "Occupancy";
    }>;
    billingPeriod: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
export declare const GenerateReportResponseSchema: z.ZodObject<{
    reportType: z.ZodString;
    summary: z.ZodAny;
}, z.core.$strip>;
export type GenerateReportResponse = z.infer<typeof GenerateReportResponseSchema>;
export declare const SendReminderRequestSchema: z.ZodObject<{
    residentId: z.ZodString;
    billId: z.ZodString;
    customMessage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SendReminderRequest = z.infer<typeof SendReminderRequestSchema>;
export declare const SendReminderResponseSchema: z.ZodObject<{
    reminderStatus: z.ZodString;
    residentName: z.ZodString;
    emailTarget: z.ZodString;
    notificationMessage: z.ZodString;
    invoiceDueDate: z.ZodAny;
    timestamp: z.ZodAny;
}, z.core.$strip>;
export type SendReminderResponse = z.infer<typeof SendReminderResponseSchema>;
