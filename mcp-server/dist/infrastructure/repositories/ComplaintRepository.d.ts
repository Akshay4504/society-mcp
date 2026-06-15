import { IComplaintRepository } from '../../domain/repositories/ComplaintRepository.interface.js';
import { IComplaint } from '../../models/Complaint.js';
export declare class ComplaintRepository implements IComplaintRepository {
    save(complaint: Partial<IComplaint>): Promise<IComplaint>;
    findAll(): Promise<IComplaint[]>;
}
