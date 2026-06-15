import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { GetResidentRequestSchema, GetResidentResponseSchema, GetResidentResponse } from '../schemas/toolSchemas.js';

export class GetResidentService {
  constructor(private residentRepository: IResidentRepository) {}

  async execute(input: any): Promise<GetResidentResponse> {
    const validatedInput = GetResidentRequestSchema.parse(input);
    const resident = await this.residentRepository.findByUnit(validatedInput.block, validatedInput.flatNumber);

    const result = {
      resident: resident ? resident.toObject ? resident.toObject() : resident : null,
      message: resident ? undefined : `No resident profile found for Unit ${validatedInput.block}-${validatedInput.flatNumber}.`
    };

    return GetResidentResponseSchema.parse(result);
  }
}
