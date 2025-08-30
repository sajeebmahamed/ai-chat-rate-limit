// User Types
export enum UserType {
  GUEST = 'guest',
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface User {
  id: string;
  email: string;
  password: string;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  type: UserType;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  type: UserType;
}
