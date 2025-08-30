import { CreateUserDto, LoginDto } from '../types/user.type';
import { AuthResponse } from '../services/auth.service';

export interface IAuthService {
  createUser(createUserDto: CreateUserDto): Promise<AuthResponse>;
  loginUser(loginDto: LoginDto): Promise<AuthResponse>;
}
