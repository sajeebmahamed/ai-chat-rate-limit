import { Router } from 'express';
import { container } from '../config/inversify.config';
import { TYPES } from '../constants/types';
import { IChatController } from '../interfaces/chat-controller.interface';
import { IRateLimitMiddleware } from '../interfaces/rate-limit-middleware.interface';

const router = Router();
const chatController = container.get<IChatController>(TYPES.ChatController);
const rateLimitMiddleware = container.get<IRateLimitMiddleware>(TYPES.RateLimitMiddleware);

router.post(
  '/chat',
  (req, res, next) => rateLimitMiddleware.checkRateLimit(req, res, next),
  (req, res) => chatController.sendMessage(req, res)
);

export { router as chatRoutes };
