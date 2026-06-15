import { INoticeRepository } from '../domain/repositories/NoticeRepository.interface.js';
import { ISocietyRepository } from '../domain/repositories/SocietyRepository.interface.js';
import { IUserRepository } from '../domain/repositories/UserRepository.interface.js';
import { CreateNoticeRequestSchema, CreateNoticeResponseSchema, CreateNoticeResponse } from '../schemas/toolSchemas.js';

export class CreateNoticeService {
  constructor(
    private noticeRepository: INoticeRepository,
    private societyRepository: ISocietyRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: any): Promise<CreateNoticeResponse> {
    const validatedInput = CreateNoticeRequestSchema.parse(input);

    const society = await this.societyRepository.findFirst();
    if (!society) {
      throw new Error("Error: No housing society registered in the database.");
    }

    const admin = await this.userRepository.findAdminUser();
    if (!admin) {
      throw new Error("Error: No registered user found in the database to author the notice.");
    }

    const newNotice = await this.noticeRepository.save({
      societyId: society._id,
      authorId: admin._id,
      title: validatedInput.title,
      content: validatedInput.content,
      category: validatedInput.category,
      targetAudience: validatedInput.targetAudience,
      isPinned: validatedInput.isPinned
    });

    const result = {
      notice: newNotice.toObject ? newNotice.toObject() : newNotice
    };

    return CreateNoticeResponseSchema.parse(result);
  }
}
