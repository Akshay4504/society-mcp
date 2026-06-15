import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { GetResidentResponse } from '../schemas/toolSchemas.js';
export declare class GetResidentService {
    private residentRepository;
    constructor(residentRepository: IResidentRepository);
    execute(input: any): Promise<GetResidentResponse>;
}
