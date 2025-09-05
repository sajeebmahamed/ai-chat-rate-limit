import { injectable } from 'inversify';
import { UserType } from '../types/user.type';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface WindowData {
  count: number;
  startTime: number;
}

@injectable()
export class RateLimiterService {
  private readonly rateLimitConfig = {
    [UserType.GUEST]: 3,
    [UserType.FREE]: 10,
    [UserType.PREMIUM]: 50,
  };

  private readonly windowDurationMs = 60 * 60 * 1000; // 1 hour in milliseconds
  private readonly rateLimitStore: Map<string, WindowData> = new Map();

  public checkRateLimit(identifier: string, userType: UserType): RateLimitResult {
    const limit = this.rateLimitConfig[userType];
    const currentTime = Date.now();

    const key = `${identifier}:${userType}`;
    const existingWindow = this.rateLimitStore.get(key);

    let windowData: WindowData;

    if (!existingWindow || this.isWindowExpired(existingWindow.startTime, currentTime)) {
      windowData = {
        count: 1,
        startTime: currentTime,
      };
      this.rateLimitStore.set(key, windowData);
    } else {
      windowData = {
        ...existingWindow,
        count: existingWindow.count + 1,
      };
      this.rateLimitStore.set(key, windowData);
    }

    const remaining = Math.max(0, limit - windowData.count);
    const resetTime = windowData.startTime + this.windowDurationMs;

    if (windowData.count > limit) {
      const retryAfter = Math.ceil((resetTime - currentTime) / 1000);
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    return {
      allowed: true,
      limit,
      remaining: remaining,
      resetTime,
    };
  }

  public getRateLimitInfo(identifier: string, userType: UserType): RateLimitResult {
    const limit = this.rateLimitConfig[userType];
    const currentTime = Date.now();

    const key = `${identifier}:${userType}`;
    const existingWindow = this.rateLimitStore.get(key);

    if (!existingWindow || this.isWindowExpired(existingWindow.startTime, currentTime)) {
      return {
        allowed: true,
        limit,
        remaining: limit,
        resetTime: currentTime + this.windowDurationMs,
      };
    }

    const remaining = Math.max(0, limit - existingWindow.count);
    const resetTime = existingWindow.startTime + this.windowDurationMs;

    const result: RateLimitResult = {
      allowed: remaining > 0,
      limit,
      remaining,
      resetTime,
    };

    if (remaining === 0) {
      result.retryAfter = Math.ceil((resetTime - currentTime) / 1000);
    }

    return result;
  }

  public resetUserLimit(identifier: string, userType: UserType): void {
    const key = `${identifier}:${userType}`;
    this.rateLimitStore.delete(key);
  }

  public cleanupExpiredWindows(): number {
    const currentTime = Date.now();
    let deletedCount = 0;

    for (const [key, windowData] of this.rateLimitStore.entries()) {
      if (this.isWindowExpired(windowData.startTime, currentTime)) {
        this.rateLimitStore.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  public getUserTypeLimit(userType: UserType): number {
    return this.rateLimitConfig[userType];
  }

  private isWindowExpired(windowStartTime: number, currentTime: number): boolean {
    return currentTime - windowStartTime >= this.windowDurationMs;
  }

  public getActiveWindowsCount(): number {
    return this.rateLimitStore.size;
  }

  public getAllLimits(): Record<UserType, number> {
    return { ...this.rateLimitConfig };
  }
}
