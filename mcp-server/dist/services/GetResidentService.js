import { GetResidentRequestSchema, GetResidentResponseSchema } from '../schemas/toolSchemas.js';
export class GetResidentService {
    residentRepository;
    constructor(residentRepository) {
        this.residentRepository = residentRepository;
    }
    async execute(input) {
        const validatedInput = GetResidentRequestSchema.parse(input);
        const resident = await this.residentRepository.findByUnit(validatedInput.block, validatedInput.flatNumber);
        const result = {
            resident: resident ? resident.toObject ? resident.toObject() : resident : null,
            message: resident ? undefined : `No resident profile found for Unit ${validatedInput.block}-${validatedInput.flatNumber}.`
        };
        return GetResidentResponseSchema.parse(result);
    }
}
//# sourceMappingURL=GetResidentService.js.map