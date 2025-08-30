import { injectable } from 'inversify';
import { User } from '../types/user.type';
import { IUserRepository } from '../interfaces/user-repository.interface';

@injectable()
export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  public create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  public findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return Promise.resolve(user);
      }
    }
    return Promise.resolve(null);
  }

  public findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  public getAllUsers(): Promise<User[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  public deleteById(id: string): Promise<boolean> {
    return Promise.resolve(this.users.delete(id));
  }

  public clear(): Promise<void> {
    this.users.clear();
    return Promise.resolve();
  }
}
