import { User } from '../../models/User.js';
export class UserRepository {
    async findAdminUser() {
        const admin = await User.findOne({ role: 'SocietyAdmin' });
        if (admin)
            return admin;
        return User.findOne();
    }
    async findById(id) {
        return User.findById(id);
    }
}
//# sourceMappingURL=UserRepository.js.map