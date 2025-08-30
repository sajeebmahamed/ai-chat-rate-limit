import { AuthenticatedUser } from '../types/user.type';

export interface IAuthUtil {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  generateUserId(): string;
  generateJwtToken(user: AuthenticatedUser): string;
  verifyJwtToken(token: string): AuthenticatedUser;
}
