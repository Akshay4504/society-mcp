import { IUserRepository } from '../../domain/repositories/UserRepository.interface.js';
import { IUser } from '../../models/User.js';
export declare class UserRepository implements IUserRepository {
    findAdminUser(): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
}
