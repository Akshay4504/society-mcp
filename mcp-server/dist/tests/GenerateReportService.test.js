import assert from 'assert';
import { GenerateReportService } from '../services/GenerateReportService.js';
export async function runGenerateReportServiceTests() {
    console.log("Running GenerateReportService unit tests...");
    const mockPaymentRepo = {
        findBills: async () => [],
        findPayments: async () => [
            { status: 'Success', amountPaid: 3200 },
            { status: 'Pending', amountPaid: 1500 }
        ],
        findBillById: async () => null
    };
    const mockComplaintRepo = {
        save: async () => ({}),
        findAll: async () => [
            { status: 'Open' },
            { status: 'Resolved' }
        ]
    };
    const mockResidentRepo = {
        findByUnit: async () => null,
        findById: async () => null,
        findAll: async () => [
            { occupancyType: 'Owner', status: 'Active' },
            { occupancyType: 'Tenant', status: 'Active' }
        ]
    };
    const service = new GenerateReportService(mockPaymentRepo, mockComplaintRepo, mockResidentRepo);
    // Test Collections report
    const resCollections = await service.execute({ reportType: 'Collections' });
    assert.strictEqual(resCollections.reportType, 'Collections');
    assert.strictEqual(resCollections.summary.totalClearedCollections, '₹3200');
    assert.strictEqual(resCollections.summary.pendingReconciliationAmount, '₹1500');
    // Test Tickets report
    const resTickets = await service.execute({ reportType: 'Tickets' });
    assert.strictEqual(resTickets.reportType, 'Tickets');
    assert.strictEqual(resTickets.summary.totalTicketsCount, 2);
    assert.strictEqual(resTickets.summary.openTicketsCount, 1);
    assert.strictEqual(resTickets.summary.resolvedOrClosedCount, 1);
    // Test Occupancy report
    const resOccupancy = await service.execute({ reportType: 'Occupancy' });
    assert.strictEqual(resOccupancy.reportType, 'Occupancy');
    assert.strictEqual(resOccupancy.summary.totalRegisteredResidents, 2);
    assert.strictEqual(resOccupancy.summary.ownerResidents, 1);
    assert.strictEqual(resOccupancy.summary.tenantResidents, 1);
    console.log("✅ GenerateReportService unit tests passed!");
}
//# sourceMappingURL=GenerateReportService.test.js.map