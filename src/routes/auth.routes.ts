import { Router } from 'express';
import { container } from '../config/inversify.config';
import { TYPES } from '../constants/types';
import { IAuthController } from '../interfaces/auth-controller.interface';
import { IAuthMiddleware } from '../interfaces/auth-middleware.interface';

const router = Router();
const authController = container.get<IAuthController>(TYPES.AuthController);
const authMiddleware = container.get<IAuthMiddleware>(TYPES.AuthMiddleware);

router.post('/register', (req, res) => authController.createUser(req, res));
router.post('/login', (req, res) => authController.loginUser(req, res));

// Protected test endpoint
router.get(
  '/profile',
  (req, res, next) => authMiddleware.authenticate(req, res, next),
  (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user,
        message: 'Access granted to protected endpoint',
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
      },
    });
  }
);

export { router as authRoutes };
