import { INoticeRepository } from '../domain/repositories/NoticeRepository.interface.js';
import { ISocietyRepository } from '../domain/repositories/SocietyRepository.interface.js';
import { IUserRepository } from '../domain/repositories/UserRepository.interface.js';
import { CreateNoticeResponse } from '../schemas/toolSchemas.js';
export declare class CreateNoticeService {
    private noticeRepository;
    private societyRepository;
    private userRepository;
    constructor(noticeRepository: INoticeRepository, societyRepository: ISocietyRepository, userRepository: IUserRepository);
    execute(input: any): Promise<CreateNoticeResponse>;
}
