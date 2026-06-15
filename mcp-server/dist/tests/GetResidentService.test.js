import assert from 'assert';
import { GetResidentService } from '../services/GetResidentService.js';
export async function runGetResidentServiceTests() {
    console.log("Running GetResidentService unit tests...");
    // Mock repository implementation
    const mockResidentRepo = {
        findByUnit: async (block, flatNumber) => {
            if (block === 'A' && flatNumber === '101') {
                return {
                    toObject: () => ({ block: 'A', flatNumber: '101', status: 'Active' }),
                    block: 'A',
                    flatNumber: '101',
                    status: 'Active'
                };
            }
            return null;
        },
        findById: async (id) => null,
        findAll: async () => []
    };
    const service = new GetResidentService(mockResidentRepo);
    // Test Case 1: Resident exists
    const res1 = await service.execute({ block: 'A', flatNumber: '101' });
    assert.strictEqual(res1.resident?.block, 'A');
    assert.strictEqual(res1.resident?.flatNumber, '101');
    assert.strictEqual(res1.message, undefined);
    // Test Case 2: Resident doesn't exist
    const res2 = await service.execute({ block: 'B', flatNumber: '202' });
    assert.strictEqual(res2.resident, null);
    assert.ok(res2.message?.includes('No resident profile found'));
    // Test Case 3: Validation fails (missing arguments)
    try {
        await service.execute({ block: '' });
        assert.fail("Should have failed validation");
    }
    catch (err) {
        assert.ok(err.name === "ZodError" || err.message.includes("required"));
    }
    console.log("✅ GetResidentService unit tests passed!");
}
//# sourceMappingURL=GetResidentService.test.js.map