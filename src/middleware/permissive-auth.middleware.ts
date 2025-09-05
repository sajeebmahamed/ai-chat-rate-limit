import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { TYPES } from '../constants/types';
import config from '../config/environment';

@injectable()
export class PermissiveAuthMiddleware {
  constructor(@inject(TYPES.UserRepository) private userRepository: IUserRepository) {}

  public authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        next();
        return;
      }

      try {
        // const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
        // const user = await this.userRepository.findById(decoded.userId);

        const decoded = jwt.verify(token, config.auth.jwtSecret) as { id: string };
        const user = await this.userRepository.findById(decoded.id);

        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            type: user.type,
          };
        }
      } catch {
        // Invalid token, continue as guest
      }

      next();
    } catch {
      // Continue as guest on any error
      next();
    }
  };
}
