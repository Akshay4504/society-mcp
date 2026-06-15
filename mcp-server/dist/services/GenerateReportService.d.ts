import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { IComplaintRepository } from '../domain/repositories/ComplaintRepository.interface.js';
import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { GenerateReportResponse } from '../schemas/toolSchemas.js';
export declare class GenerateReportService {
    private paymentRepository;
    private complaintRepository;
    private residentRepository;
    constructor(paymentRepository: IPaymentRepository, complaintRepository: IComplaintRepository, residentRepository: IResidentRepository);
    execute(input: any): Promise<GenerateReportResponse>;
}
