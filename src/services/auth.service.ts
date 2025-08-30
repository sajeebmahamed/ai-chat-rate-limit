import { injectable, inject } from 'inversify';
import { CreateUserDto, LoginDto, User, AuthenticatedUser } from '../types/user.type';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { IAuthService } from '../interfaces/auth-service.interface';
import { IAuthUtil } from '../interfaces/auth-util.interface';
import { TYPES } from '../constants/types';

export interface AuthResponse {
  user: AuthenticatedUser;
  token: string;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.AuthUtil) private authUtil: IAuthUtil
  ) {}

  public async createUser(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await this.authUtil.hashPassword(createUserDto.password);
    const userId = this.authUtil.generateUserId();

    const user: User = {
      id: userId,
      email: createUserDto.email,
      password: hashedPassword,
      type: createUserDto.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userRepository.create(user);

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      type: user.type,
    };

    const token = this.authUtil.generateJwtToken(authenticatedUser);

    return {
      user: authenticatedUser,
      token,
    };
  }

  public async loginUser(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.authUtil.comparePassword(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      type: user.type,
    };

    const token = this.authUtil.generateJwtToken(authenticatedUser);

    return {
      user: authenticatedUser,
      token,
    };
  }
}
