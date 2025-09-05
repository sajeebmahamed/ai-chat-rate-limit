import { Request, Response, NextFunction } from 'express';

export interface IPermissiveAuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
}
