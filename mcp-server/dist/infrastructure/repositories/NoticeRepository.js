import { Notice } from '../../models/Notice.js';
export class NoticeRepository {
    async save(notice) {
        const doc = new Notice(notice);
        return doc.save();
    }
    async findAllSortedByDate() {
        return Notice.find().sort({ createdAt: -1 });
    }
}
//# sourceMappingURL=NoticeRepository.js.map