import { User } from '../entities/User';

export interface IUserRepository {
  findAll(options?: { limit?: number; offset?: number }): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
