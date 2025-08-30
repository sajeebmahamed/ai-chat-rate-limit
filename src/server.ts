import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { Container } from 'inversify';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/environment';
import logger from './utils/logger';
import { setupDependencyInjection } from './config/inversify.config';
import { TYPES } from './constants/types';
import { IAuthController } from './interfaces/auth-controller.interface';
import { IAuthMiddleware } from './interfaces/auth-middleware.interface';

class Server {
  private app: express.Application;
  private container: Container;

  constructor() {
    this.app = express();
    this.container = setupDependencyInjection();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    if (config.security.enableHelmet) {
      this.app.use(
        helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'https:'],
            },
          },
          hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
        })
      );
    }
    // CORS configuration
    if (config.cors.enabled) {
      this.app.use(
        cors({
          origin: config.cors.origin === '*' ? true : config.cors.origin.split(','),
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
          exposedHeaders: [
            'X-Request-ID',
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
          ],
        })
      );
    }
    // Body parsing middleware
    this.app.use(express.json({ limit: config.security.maxRequestSize }));
    this.app.use(express.urlencoded({ extended: true, limit: config.security.maxRequestSize }));

    // Request logging
    if (config.nodeEnv === 'development') {
      this.app.use(
        morgan('combined', {
          stream: { write: (message: string) => logger.info(message.trim()) },
        })
      );
    } else {
      this.app.use(
        morgan('combined', {
          stream: { write: (message: string) => logger.info(message.trim()) },
          skip: (_req, res) => res.statusCode < 400, // Only log errors in production
        })
      );
    }
  }
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: process.env['npm_package_version'] || '1.0.0',
          environment: config.nodeEnv,
          uptime: process.uptime(),
        },
      });
    });

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'AI Chat Rate Limiter API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          status: '/api/status',
        },
      });
    });

    // Get controller instances from DI container
    const authController = this.container.get<IAuthController>(TYPES.AuthController);
    const authMiddleware = this.container.get<IAuthMiddleware>(TYPES.AuthMiddleware);

    // Authentication routes
    const authRouter = express.Router();
    authRouter.post('/register', (req, res) => authController.createUser(req, res));
    authRouter.post('/login', (req, res) => authController.loginUser(req, res));
    authRouter.get(
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
            requestId: Array.isArray(req.headers['x-request-id'])
              ? req.headers['x-request-id'][0]
              : req.headers['x-request-id'] || 'unknown',
            version: '1.0.0',
          },
        });
      }
    );

    this.app.use('/api/auth', authRouter);

    // Catch-all route for 404
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: 'unknown',
          version: '1.0.0',
        },
      });
    });
  }
  private setupErrorHandling(): void {}

  public start(): void {
    try {
      // Start HTTP server
      const server = this.app.listen(config.port, () => {
        logger.info(`Server started on port ${config.port}`, {
          nodeEnv: config.nodeEnv,
          corsEnabled: config.cors.enabled,
          helmetEnabled: config.security.enableHelmet,
        });
      });

      // Graceful shutdown handling
      const gracefulShutdown = async (signal: string) => {
        logger.info(`Received ${signal}, shutting down gracefully`);

        server.close(() => {
          logger.info('Server shutdown completed');
          process.exit(0);
        });
      };

      // Handle shutdown signals
      process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

      // Handle uncaught exceptions
      process.on('uncaughtException', error => {
        logger.error('Uncaught exception', { error });
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled rejection', {
          error: reason instanceof Error ? reason : new Error(String(reason)),
          promise,
        });
        process.exit(1);
      });
    } catch (error) {
      logger.error('Failed to start server', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start server
if (require.main === module) {
  const server = new Server();
  server.start();
}

export default Server;
