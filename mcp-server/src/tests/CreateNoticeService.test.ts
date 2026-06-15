import assert from 'assert';
import { CreateNoticeService } from '../services/CreateNoticeService.js';
import { INoticeRepository } from '../domain/repositories/NoticeRepository.interface.js';
import { ISocietyRepository } from '../domain/repositories/SocietyRepository.interface.js';
import { IUserRepository } from '../domain/repositories/UserRepository.interface.js';

export async function runCreateNoticeServiceTests() {
  console.log("Running CreateNoticeService unit tests...");

  const mockSocietyRepo: ISocietyRepository = {
    findFirst: async () => ({ _id: 'society123', name: 'Palm Grove', registrationNumber: 'REG-123' } as any)
  };

  const mockUserRepo: IUserRepository = {
    findAdminUser: async () => ({ _id: 'admin123', email: 'admin@gmail.com', role: 'SocietyAdmin' } as any),
    findById: async (id) => null
  };

  let savedNotice: any = null;
  const mockNoticeRepo: INoticeRepository = {
    save: async (notice) => {
      savedNotice = notice;
      return {
        ...notice,
        toObject: () => notice
      } as any;
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
