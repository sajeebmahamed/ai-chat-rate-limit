import { injectable } from 'inversify';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/environment';
import { AuthenticatedUser, UserType } from '../types/user.type';
import { IAuthUtil } from '../interfaces/auth-util.interface';

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
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload & {
      id: string;
      email: string;
      type: UserType;
    };

    if (!decoded.id || !decoded.email || !decoded.type) {
      throw new Error('Invalid token payload');
    }

    return {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
    };
  }
}
