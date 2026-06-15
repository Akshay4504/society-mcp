import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { GetPendingPaymentsResponse } from '../schemas/toolSchemas.js';
export declare class GetPendingPaymentsService {
    private paymentRepository;
    constructor(paymentRepository: IPaymentRepository);
    execute(input: any): Promise<GetPendingPaymentsResponse>;
}
