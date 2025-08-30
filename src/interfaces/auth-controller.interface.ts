import { Request, Response } from 'express';

export interface IAuthController {
  createUser(req: Request, res: Response): Promise<void>;
  loginUser(req: Request, res: Response): Promise<void>;
}
