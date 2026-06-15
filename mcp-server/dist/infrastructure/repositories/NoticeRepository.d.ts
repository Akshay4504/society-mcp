import { INoticeRepository } from '../../domain/repositories/NoticeRepository.interface.js';
import { INotice } from '../../models/Notice.js';
export declare class NoticeRepository implements INoticeRepository {
    save(notice: Partial<INotice>): Promise<INotice>;
    findAllSortedByDate(): Promise<INotice[]>;
}
