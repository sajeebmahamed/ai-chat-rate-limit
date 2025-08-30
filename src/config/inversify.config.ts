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

const container = new Container();

container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IAuthUtil>(TYPES.AuthUtil).to(AuthUtil).inSingletonScope();
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IAuthController>(TYPES.AuthController).to(AuthController);
container.bind<IAuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);

export { container };
