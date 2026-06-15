import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { IComplaintRepository } from '../domain/repositories/ComplaintRepository.interface.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { GenerateReportRequestSchema, GenerateReportResponseSchema, GenerateReportResponse } from '../schemas/toolSchemas.js';

export class GenerateReportService {
  constructor(
    private paymentRepository: IPaymentRepository,
    private complaintRepository: IComplaintRepository,
    private residentRepository: IResidentRepository
  ) {}

  async execute(input: any): Promise<GenerateReportResponse> {
    const validatedInput = GenerateReportRequestSchema.parse(input);

    let summary: any;

    if (validatedInput.reportType === "Collections") {
      const payments = await this.paymentRepository.findPayments({});
      const successPayments = payments.filter((p: any) => p.status === 'Success');
      const pendingPayments = payments.filter((p: any) => p.status === 'Pending');

      const totalCollected = successPayments.reduce((sum, p) => sum + p.amountPaid, 0);
      const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amountPaid, 0);

      summary = {
        report: "Direct Database Collections Assessment",
        totalClearedCollections: `₹${totalCollected}`,
        pendingReconciliationLogs: `${pendingPayments.length} Logs`,
        pendingReconciliationAmount: `₹${totalPendingAmount}`,
        cycle: validatedInput.billingPeriod || "All billing periods"
      };
    } else if (validatedInput.reportType === "Tickets") {
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
    } else {
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
