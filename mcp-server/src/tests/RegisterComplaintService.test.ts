import assert from 'assert';
import { RegisterComplaintService } from '../services/RegisterComplaintService.js';
import { IComplaintRepository } from '../domain/repositories/ComplaintRepository.interface.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';

export async function runRegisterComplaintServiceTests() {
  console.log("Running RegisterComplaintService unit tests...");

  const mockResidentRepo: IResidentRepository = {
    findByUnit: async (block, flatNumber) => {
      if (block === 'B' && flatNumber === '304') {
        return {
          societyId: 'society123',
          userId: 'user123',
          block,
          flatNumber
        } as any;
      }
      return null;
    },
    findById: async (id) => null,
    findAll: async () => []
  };

  let savedData: any = null;
  const mockComplaintRepo: IComplaintRepository = {
    save: async (complaint) => {
      savedData = complaint;
      return {
        ...complaint,
        toObject: () => complaint
      } as any;
    },
    findAll: async () => []
  };

  const service = new RegisterComplaintService(mockComplaintRepo, mockResidentRepo);

  // Test Case 1: Triage Plumbing category and High priority
  const res = await service.execute({
    block: 'B',
    flatNumber: '304',
    title: 'Water pipe leak',
    description: 'The plumbing pipe is broken under the sink and leaking water.'
  });

  assert.ok(res.complaint);
  assert.strictEqual(savedData.raisedBy, 'user123');
  assert.strictEqual(savedData.aiAnalysis.detectedCategory, 'Plumbing');
  assert.strictEqual(savedData.aiAnalysis.estimatedPriority, 'High');

  // Test Case 2: Emergency / Critical
  await service.execute({
    block: 'B',
    flatNumber: '304',
    title: 'Power failure and shock danger',
    description: 'A wire is sparking and giving shocks. Emergency!'
  });
  assert.strictEqual(savedData.aiAnalysis.detectedCategory, 'Electrical');
  assert.strictEqual(savedData.aiAnalysis.estimatedPriority, 'Critical');

  console.log("✅ RegisterComplaintService unit tests passed!");
}
