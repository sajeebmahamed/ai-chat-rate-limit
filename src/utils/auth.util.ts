import { injectable } from 'inversify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/environment';
import { AuthenticatedUser, UserType } from '../types/user.type';
import { IAuthUtil } from '../interfaces/auth-util.interface';

export interface DecodedToken {
  id: string;
  email: string;
  type: UserType;
  iat: number;
  exp: number;
}

@injectable()
export class AuthUtil implements IAuthUtil {
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.auth.bcryptSaltRounds);
  }

  public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public generateUserId(): string {
    return uuidv4();
  }

  public generateJwtToken(user: AuthenticatedUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type,
    };

    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  public verifyJwtToken(token: string): AuthenticatedUser {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as DecodedToken;

      if (!decoded.id || !decoded.email || !decoded.type) {
        throw new Error('Invalid token payload');
      }

      return {
        id: decoded.id,
        email: decoded.email,
        type: decoded.type,
      };
    } catch (error) {
      throw new Error(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    return token || null;
  }

  public isTokenExpired(decoded: DecodedToken): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime;
  }

  public getUserFromToken(token: string): AuthenticatedUser | null {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as DecodedToken;

      if (!decoded.id || !decoded.email || !decoded.type) {
        return null;
      }

      if (this.isTokenExpired(decoded)) {
        return null;
      }

      return {
        id: decoded.id,
        email: decoded.email,
        type: decoded.type,
      };
    } catch {
      return null;
    }
  }
}
