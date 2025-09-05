import { AuthenticatedUser } from '../types/user.type';
import { DecodedToken } from '../utils/auth.util';

export interface IAuthUtil {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashedPassword: string): Promise<boolean>;
  generateUserId(): string;
  generateJwtToken(user: AuthenticatedUser): string;
  verifyJwtToken(token: string): AuthenticatedUser;
  extractTokenFromHeader(authHeader?: string): string | null;
  isTokenExpired(decoded: DecodedToken): boolean;
  getUserFromToken(token: string): AuthenticatedUser | null;
}
