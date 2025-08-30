import 'reflect-metadata';
import { Container } from 'inversify';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthUtil } from '../utils/auth.util';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { IAuthUtil } from '../interfaces/auth-util.interface';
import { IAuthMiddleware } from '../interfaces/auth-middleware.interface';
import { TYPES } from '../constants/types';

export function setupDependencyInjection(): Container {
  const container = new Container();

  // Bind repositories
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

  // Bind utilities
  container.bind<IAuthUtil>(TYPES.AuthUtil).to(AuthUtil).inSingletonScope();

  // Bind services
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService);

  // Bind controllers
  container.bind<IAuthController>(TYPES.AuthController).to(AuthController);

  // Bind middleware
  container.bind<IAuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);

  return container;
}

// Export container instance for backward compatibility
export const container = setupDependencyInjection();
