import { INoticeRepository } from '../../domain/repositories/NoticeRepository.interface.js';
import { Notice, INotice } from '../../models/Notice.js';

export class NoticeRepository implements INoticeRepository {
  async save(notice: Partial<INotice>): Promise<INotice> {
    const doc = new Notice(notice);
    return doc.save();
  }

  async findAllSortedByDate(): Promise<INotice[]> {
    return Notice.find().sort({ createdAt: -1 });
  }
}
