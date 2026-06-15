import { IComplaintRepository } from '../../domain/repositories/ComplaintRepository.interface.js';
import { Complaint, IComplaint } from '../../models/Complaint.js';

export class ComplaintRepository implements IComplaintRepository {
  async save(complaint: Partial<IComplaint>): Promise<IComplaint> {
    const doc = new Complaint(complaint);
    return doc.save();
  }

  async findAll(): Promise<IComplaint[]> {
    return Complaint.find();
  }
}
