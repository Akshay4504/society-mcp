import { IUser } from '../../models/User.js';

export interface IUserRepository {
  findAdminUser(): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
}
