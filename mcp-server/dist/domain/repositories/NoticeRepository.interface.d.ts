import { INotice } from '../../models/Notice.js';
export interface INoticeRepository {
    save(notice: any): Promise<INotice>;
    findAllSortedByDate(): Promise<INotice[]>;
}
