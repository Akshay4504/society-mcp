import assert from 'assert';
import { CreateNoticeService } from '../services/CreateNoticeService.js';
export async function runCreateNoticeServiceTests() {
    console.log("Running CreateNoticeService unit tests...");
    const mockSocietyRepo = {
        findFirst: async () => ({ _id: 'society123', name: 'Palm Grove', registrationNumber: 'REG-123' })
    };
    const mockUserRepo = {
        findAdminUser: async () => ({ _id: 'admin123', email: 'admin@gmail.com', role: 'SocietyAdmin' }),
        findById: async (id) => null
    };
    let savedNotice = null;
    const mockNoticeRepo = {
        save: async (notice) => {
            savedNotice = notice;
            return {
                ...notice,
                toObject: () => notice
            };
        },
        findAllSortedByDate: async () => []
    };
    const service = new CreateNoticeService(mockNoticeRepo, mockSocietyRepo, mockUserRepo);
    const res = await service.execute({
        title: 'Water cut announcement',
        content: 'Water supply will be stopped on Sunday.',
        category: 'Emergency',
        targetAudience: 'All',
        isPinned: true
    });
    assert.ok(res.notice);
    assert.strictEqual(savedNotice.authorId, 'admin123');
    assert.strictEqual(savedNotice.societyId, 'society123');
    assert.strictEqual(savedNotice.title, 'Water cut announcement');
    assert.strictEqual(savedNotice.category, 'Emergency');
    assert.strictEqual(savedNotice.isPinned, true);
    console.log("✅ CreateNoticeService unit tests passed!");
}
//# sourceMappingURL=CreateNoticeService.test.js.map