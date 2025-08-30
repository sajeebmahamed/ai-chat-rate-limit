import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { createUserSchema, loginSchema } from '../validators/auth.validator';
import { CreateUserDto, LoginDto } from '../types/user.type';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { TYPES } from '../constants/types';

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = createUserSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => detail.message),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
        return;
      }

      const createUserDto: CreateUserDto = value;
      const result = await this.authService.createUser(createUserDto);

      res.status(201).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(400).json({
        success: false,
        error: errorMessage,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    }
  };

  public loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = loginSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => detail.message),
          meta: {
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
        return;
      }

      const loginDto: LoginDto = value;
      const result = await this.authService.loginUser(loginDto);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      res.status(401).json({
        success: false,
        error: errorMessage,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
          version: '1.0.0',
        },
      });
    }
  };
}
