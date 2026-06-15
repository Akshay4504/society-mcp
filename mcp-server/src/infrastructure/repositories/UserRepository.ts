import { IUserRepository } from '../../domain/repositories/UserRepository.interface.js';
import { User, IUser } from '../../models/User.js';

export class UserRepository implements IUserRepository {
  async findAdminUser(): Promise<IUser | null> {
    const admin = await User.findOne({ role: 'SocietyAdmin' });
    if (admin) return admin;
    return User.findOne();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }
}
