import { CreateNoticeRequestSchema, CreateNoticeResponseSchema } from '../schemas/toolSchemas.js';
export class CreateNoticeService {
    noticeRepository;
    societyRepository;
    userRepository;
    constructor(noticeRepository, societyRepository, userRepository) {
        this.noticeRepository = noticeRepository;
        this.societyRepository = societyRepository;
        this.userRepository = userRepository;
    }
    async execute(input) {
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
//# sourceMappingURL=CreateNoticeService.js.map