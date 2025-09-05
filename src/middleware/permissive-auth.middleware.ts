import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IAuthUtil } from '../interfaces/auth-util.interface';
import { TYPES } from '../constants/types';

@injectable()
export class PermissiveAuthMiddleware {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.AuthUtil) private authUtil: IAuthUtil
  ) {}

  public authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.authUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        next();
        return;
      }

      try {
        const authenticatedUser = this.authUtil.getUserFromToken(token);

        if (authenticatedUser) {
          // Verify user still exists in repository
          const user = await this.userRepository.findById(authenticatedUser.id);

          if (user) {
            req.user = authenticatedUser;
          }
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
