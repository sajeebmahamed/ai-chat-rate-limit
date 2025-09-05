import { UserType } from '../types/user.type';
import { RateLimitResult } from '../services/rate-limiter.service';

export interface IRateLimiterService {
  checkRateLimit(identifier: string, userType: UserType): RateLimitResult;
  getRateLimitInfo(identifier: string, userType: UserType): RateLimitResult;
  resetUserLimit(identifier: string, userType: UserType): void;
  cleanupExpiredWindows(): number;
  getUserTypeLimit(userType: UserType): number;
  getActiveWindowsCount(): number;
  getAllLimits(): Record<UserType, number>;
}
