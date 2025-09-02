import { Request, Response, NextFunction } from 'express';

export interface IRateLimitMiddleware {
  checkRateLimit(req: Request, res: Response, next: NextFunction): void;
}
