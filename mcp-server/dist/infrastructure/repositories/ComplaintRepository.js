import { Complaint } from '../../models/Complaint.js';
export class ComplaintRepository {
    async save(complaint) {
        const doc = new Complaint(complaint);
        return doc.save();
    }
    async findAll() {
        return Complaint.find();
    }
}
//# sourceMappingURL=ComplaintRepository.js.map