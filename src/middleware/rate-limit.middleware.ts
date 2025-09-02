import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { IRateLimitMiddleware } from '../interfaces/rate-limit-middleware.interface';

interface RateLimitData {
  count: number;
  startTime: number;
}

@injectable()
export class RateLimitMiddleware implements IRateLimitMiddleware {
  private rateLimitWindows = 60 * 1000; // 1 minute
  private maxRequestPerWindow = 5;
  private ipRequests: Record<string, RateLimitData> = {};

  public checkRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.socket.remoteAddress || req.ip || 'unknown';
    const currentTime = Date.now();

    if (!this.ipRequests[ip]) {
      this.ipRequests[ip] = {
        count: 1,
        startTime: currentTime,
      };
    } else {
      const timePassed = currentTime - this.ipRequests[ip].startTime;
      if (timePassed < this.rateLimitWindows) {
        this.ipRequests[ip].count++;
      } else {
        this.ipRequests[ip].count = 1;
        this.ipRequests[ip].startTime = currentTime;
      }
    }

    if (this.ipRequests[ip].count > this.maxRequestPerWindow) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Try again later',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
          rateLimitReset: new Date(
            this.ipRequests[ip].startTime + this.rateLimitWindows
          ).toISOString(),
        },
      });
      return;
    }
    next();
  };
}
