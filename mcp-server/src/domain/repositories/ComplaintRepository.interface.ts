import { IComplaint } from '../../models/Complaint.js';

export interface IComplaintRepository {
  save(complaint: any): Promise<IComplaint>;
  findAll(): Promise<IComplaint[]>;
}
