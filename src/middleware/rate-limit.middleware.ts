import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IRateLimitMiddleware } from '../interfaces/rate-limit-middleware.interface';
import { IRateLimiterService } from '../interfaces/rate-limiter-service.interface';
import { UserType } from '../types/user.type';
import { TYPES } from '../constants/types';

@injectable()
export class RateLimitMiddleware implements IRateLimitMiddleware {
  constructor(@inject(TYPES.RateLimiterService) private rateLimiterService: IRateLimiterService) {}

  public checkRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    const identifier = this.getIdentifier(req);
    const userType = this.getUserType(req);

    const rateLimitResult = this.rateLimiterService.checkRateLimit(identifier, userType);

    res.setHeader('X-RateLimit-Limit', rateLimitResult.limit.toString());
    res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    if (!rateLimitResult.allowed) {
      if (rateLimitResult.retryAfter) {
        res.setHeader('Retry-After', rateLimitResult.retryAfter.toString());
      }

      res.status(429).json({
        success: false,
        error: `Rate limit exceeded. ${userType} users can make ${rateLimitResult.limit} AI requests per hour.`,
        details: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          retryAfter: rateLimitResult.retryAfter,
          userType,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
      return;
    }

    next();
  };

  private getIdentifier(req: Request): string {
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    return `ip:${req.socket.remoteAddress || req.ip || 'unknown'}`;
  }

  private getUserType(req: Request): UserType {
    return req.user?.type || UserType.GUEST;
  }
}
