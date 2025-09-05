import { injectable, inject } from 'inversify';
import { IRateLimiterService } from '../interfaces/rate-limiter-service.interface';
import { TYPES } from '../constants/types';
import config from '../config/environment';
import logger from '../utils/logger';

@injectable()
export class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupIntervalMs = config.rateLimit.cleanupIntervalMs;

  constructor(@inject(TYPES.RateLimiterService) private rateLimiterService: IRateLimiterService) {}

  public startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    logger.info(
      `Starting rate limiter cleanup service (interval: ${this.cleanupIntervalMs / 60000} minutes)`
    );

    this.cleanupInterval = setInterval(() => {
      try {
        const deletedCount = this.rateLimiterService.cleanupExpiredWindows();
        const activeWindows = this.rateLimiterService.getActiveWindowsCount();

        if (deletedCount > 0) {
          logger.info(
            `Cleaned up expired rate limit windows (deleted: ${deletedCount}, remaining: ${activeWindows})`
          );
        }
      } catch (error) {
        logger.error('Error during rate limiter cleanup', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }, this.cleanupIntervalMs);
  }

  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Stopped rate limiter cleanup service');
    }
  }
}
