import { IComplaintRepository } from '../domain/repositories/ComplaintRepository.interface.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { RegisterComplaintRequestSchema, RegisterComplaintResponseSchema, RegisterComplaintResponse } from '../schemas/toolSchemas.js';

export class RegisterComplaintService {
  constructor(
    private complaintRepository: IComplaintRepository,
    private residentRepository: IResidentRepository
  ) {}

  async execute(input: any): Promise<RegisterComplaintResponse> {
    const validatedInput = RegisterComplaintRequestSchema.parse(input);

    const resident = await this.residentRepository.findByUnit(validatedInput.block, validatedInput.flatNumber);
    if (!resident) {
      throw new Error(`Error filing complaint: Resident for Unit ${validatedInput.block}-${validatedInput.flatNumber} not found.`);
    }

    // Local AI auto-classification rules
    const text = `${validatedInput.title} ${validatedInput.description}`.toLowerCase();
    let detectedCategory = 'General';
    let confidenceScore = 0.85;
    let estimatedPriority = 'Medium';
    let explanation = 'Classified by SMM MCP local triage rules.';

    if (text.includes('leak') || text.includes('plumb') || text.includes('water') || text.includes('pipe') || text.includes('tap')) {
      detectedCategory = 'Plumbing';
      confidenceScore = 0.95;
    } else if (text.includes('lift') || text.includes('elevator')) {
      detectedCategory = 'Elevator/Lift';
      confidenceScore = 0.98;
    } else if (text.includes('power') || text.includes('electric') || text.includes('wire') || text.includes('shock')) {
      detectedCategory = 'Electrical';
      confidenceScore = 0.96;
    } else if (text.includes('guard') || text.includes('theft') || text.includes('intruder') || text.includes('gate') || text.includes('security')) {
      detectedCategory = 'Security';
      confidenceScore = 0.92;
    }

    if (text.includes('urgent') || text.includes('emergency') || text.includes('danger') || text.includes('flood') || text.includes('shock')) {
      estimatedPriority = 'Critical';
    } else if (text.includes('broken') || text.includes('leak')) {
      estimatedPriority = 'High';
    } else if (text.includes('request') || text.includes('inquiry')) {
      estimatedPriority = 'Low';
    }

    const newComplaint = await this.complaintRepository.save({
      societyId: resident.societyId,
      raisedBy: resident.userId,
      title: validatedInput.title,
      description: validatedInput.description,
      status: 'Open',
      aiAnalysis: {
        detectedCategory,
        confidenceScore,
        estimatedPriority,
        sentimentScore: estimatedPriority === 'Critical' ? -0.8 : -0.2,
        explanation
      }
    });

    const result = {
      complaint: newComplaint.toObject ? newComplaint.toObject() : newComplaint
    };

    return RegisterComplaintResponseSchema.parse(result);
  }
}
