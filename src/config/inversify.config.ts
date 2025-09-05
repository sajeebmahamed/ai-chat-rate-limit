import 'reflect-metadata';
import { Container } from 'inversify';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { AuthUtil } from '../utils/auth.util';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { PermissiveAuthMiddleware } from '../middleware/permissive-auth.middleware';
import { ChatService } from '../services/chat.service';
import { AIService } from '../services/ai.service';
import { RateLimiterService } from '../services/rate-limiter.service';
import { CleanupService } from '../services/cleanup.service';
import { ChatController } from '../controllers/chat.controller';
import { RateLimitMiddleware } from '../middleware/rate-limit.middleware';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { IAuthUtil } from '../interfaces/auth-util.interface';
import { IAuthMiddleware } from '../interfaces/auth-middleware.interface';
import { IPermissiveAuthMiddleware } from '../interfaces/permissive-auth-middleware.interface';
import { IChatService } from '../interfaces/chat-service.interface';
import { IAIService } from '../interfaces/ai-service.interface';
import { IRateLimiterService } from '../interfaces/rate-limiter-service.interface';
import { ICleanupService } from '../interfaces/cleanup-service.interface';
import { IChatController } from '../interfaces/chat-controller.interface';
import { IRateLimitMiddleware } from '../interfaces/rate-limit-middleware.interface';
import { TYPES } from '../constants/types';

export function setupDependencyInjection(): Container {
  const container = new Container();

  // Bind repositories
  container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

  // Bind utilities
  container.bind<IAuthUtil>(TYPES.AuthUtil).to(AuthUtil).inSingletonScope();

  // Bind services
  container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
  container.bind<IChatService>(TYPES.ChatService).to(ChatService);
  container.bind<IAIService>(TYPES.AIService).to(AIService);
  container
    .bind<IRateLimiterService>(TYPES.RateLimiterService)
    .to(RateLimiterService)
    .inSingletonScope();
  container.bind<ICleanupService>(TYPES.CleanupService).to(CleanupService).inSingletonScope();

  // Bind controllers
  container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
  container.bind<IChatController>(TYPES.ChatController).to(ChatController);

  // Bind middleware
  container.bind<IAuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
  container
    .bind<IPermissiveAuthMiddleware>(TYPES.PermissiveAuthMiddleware)
    .to(PermissiveAuthMiddleware);
  container
    .bind<IRateLimitMiddleware>(TYPES.RateLimitMiddleware)
    .to(RateLimitMiddleware)
    .inSingletonScope();

  return container;
}

// Export container instance for backward compatibility
export const container = setupDependencyInjection();
