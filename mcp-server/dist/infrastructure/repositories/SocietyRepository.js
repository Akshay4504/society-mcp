import { Society } from '../../models/Society.js';
export class SocietyRepository {
    async findFirst() {
        return Society.findOne();
    }
}
//# sourceMappingURL=SocietyRepository.js.map