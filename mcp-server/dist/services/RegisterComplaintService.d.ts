import { IComplaintRepository } from '../domain/repositories/ComplaintRepository.interface.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { RegisterComplaintResponse } from '../schemas/toolSchemas.js';
export declare class RegisterComplaintService {
    private complaintRepository;
    private residentRepository;
    constructor(complaintRepository: IComplaintRepository, residentRepository: IResidentRepository);
    execute(input: any): Promise<RegisterComplaintResponse>;
}
