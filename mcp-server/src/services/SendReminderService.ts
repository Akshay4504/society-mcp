import { IResidentRepository } from '../domain/repositories/ResidentRepository.interface.js';
import { IPaymentRepository } from '../domain/repositories/PaymentRepository.interface.js';
import { SendReminderRequestSchema, SendReminderResponseSchema, SendReminderResponse } from '../schemas/toolSchemas.js';

export class SendReminderService {
  constructor(
    private residentRepository: IResidentRepository,
    private paymentRepository: IPaymentRepository
  ) {}

  async execute(input: any): Promise<SendReminderResponse> {
    const validatedInput = SendReminderRequestSchema.parse(input);

    const [resident, bill] = await Promise.all([
      this.residentRepository.findById(validatedInput.residentId),
      this.paymentRepository.findBillById(validatedInput.billId)
    ]);

    if (!resident) {
      throw new Error(`Error sending reminder: Resident ID ${validatedInput.residentId} not found.`);
    }

    if (!bill) {
      throw new Error(`Error sending reminder: Maintenance Bill ID ${validatedInput.billId} not found.`);
    }

    const userObj = (resident.userId as any);
    const firstName = userObj?.firstName || "Resident";
    const lastName = userObj?.lastName || "";
    const email = userObj?.email || "";

    const msg = validatedInput.customMessage || 
      `Dear ${firstName}, your maintenance bill dues of ₹${bill.totalAmount} for ${bill.billingPeriod} are unpaid. Please verify and clear.`;

    const result = {
      reminderStatus: "Dispatched",
      residentName: `${firstName} ${lastName}`.trim(),
      emailTarget: email,
      notificationMessage: msg,
      invoiceDueDate: bill.dueDate,
      timestamp: new Date()
    };

    return SendReminderResponseSchema.parse(result);
  }
}
