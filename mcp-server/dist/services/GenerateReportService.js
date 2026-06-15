import { GenerateReportRequestSchema, GenerateReportResponseSchema } from '../schemas/toolSchemas.js';
export class GenerateReportService {
    paymentRepository;
    complaintRepository;
    residentRepository;
    constructor(paymentRepository, complaintRepository, residentRepository) {
        this.paymentRepository = paymentRepository;
        this.complaintRepository = complaintRepository;
        this.residentRepository = residentRepository;
    }
    async execute(input) {
        const validatedInput = GenerateReportRequestSchema.parse(input);
        let summary;
        if (validatedInput.reportType === "Collections") {
            const payments = await this.paymentRepository.findPayments({});
            const successPayments = payments.filter((p) => p.status === 'Success');
            const pendingPayments = payments.filter((p) => p.status === 'Pending');
            const totalCollected = successPayments.reduce((sum, p) => sum + p.amountPaid, 0);
            const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amountPaid, 0);
            summary = {
                report: "Direct Database Collections Assessment",
                totalClearedCollections: `₹${totalCollected}`,
                pendingReconciliationLogs: `${pendingPayments.length} Logs`,
                pendingReconciliationAmount: `₹${totalPendingAmount}`,
                cycle: validatedInput.billingPeriod || "All billing periods"
            };
        }
        else if (validatedInput.reportType === "Tickets") {
            const tickets = await this.complaintRepository.findAll();
            const open = tickets.filter(t => t.status === 'Open').length;
            const assigned = tickets.filter(t => t.status === 'Assigned' || t.status === 'In-Progress').length;
            const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
            summary = {
                report: "Direct Support Ticket Analytics",
                totalTicketsCount: tickets.length,
                openTicketsCount: open,
                assignedOrInProgressCount: assigned,
                resolvedOrClosedCount: resolved,
                resolutionRatio: tickets.length ? `${Math.round((resolved / tickets.length) * 100)}%` : "N/A"
            };
        }
        else {
            const residents = await this.residentRepository.findAll();
            const owners = residents.filter(r => r.occupancyType === 'Owner').length;
            const tenants = residents.filter(r => r.occupancyType === 'Tenant').length;
            const active = residents.filter(r => r.status === 'Active').length;
            summary = {
                report: "Housing Society Occupancy telemetry",
                totalRegisteredResidents: residents.length,
                activeRosterCount: active,
                ownerResidents: owners,
                tenantResidents: tenants
            };
        }
        const result = {
            reportType: validatedInput.reportType,
            summary
        };
        return GenerateReportResponseSchema.parse(result);
    }
}
//# sourceMappingURL=GenerateReportService.js.map