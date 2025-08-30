import { User } from '../types/user.type';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  deleteById(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
