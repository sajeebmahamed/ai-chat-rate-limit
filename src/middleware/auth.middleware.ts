import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { IAuthUtil } from '../interfaces/auth-util.interface';
import { IAuthMiddleware } from '../interfaces/auth-middleware.interface';
import { TYPES } from '../constants/types';
import logger from '../utils/logger';

@injectable()
export class AuthMiddleware implements IAuthMiddleware {
  constructor(@inject(TYPES.AuthUtil) private authUtil: IAuthUtil) {}

  public authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'Authorization header is required',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: Array.isArray(req.headers['x-request-id'])
              ? req.headers['x-request-id'][0]
              : req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
        return;
      }

      const token = this.authUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Bearer token is required',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: Array.isArray(req.headers['x-request-id'])
              ? req.headers['x-request-id'][0]
              : req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
        return;
      }

      const user = this.authUtil.verifyJwtToken(token);
      req.user = user;
      next();
    } catch (error) {
      const requestId = Array.isArray(req.headers['x-request-id'])
        ? req.headers['x-request-id'][0]
        : req.headers['x-request-id'];

      logger.warn('JWT verification failed', {
        error: error instanceof Error ? error : new Error(String(error)),
        ...(requestId && { requestId }),
      });

      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    }
  };
}
