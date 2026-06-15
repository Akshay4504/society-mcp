import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { SendReminderResponse } from '../schemas/toolSchemas.js';
export declare class SendReminderService {
    private residentRepository;
    private paymentRepository;
    constructor(residentRepository: IResidentRepository, paymentRepository: IPaymentRepository);
    execute(input: any): Promise<SendReminderResponse>;
}
