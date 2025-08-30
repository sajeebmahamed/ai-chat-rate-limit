import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import config from './config/environment';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger';
import { authRoutes } from './routes/auth.routes';

class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
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
    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'AI Chat Rate Limiter API',
        version: '1.0.0',
      });
    });

    // Auth routes
    this.app.use('/api/auth', authRoutes);

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
      this.app.listen(config.port, () => {
        logger.info(`Server started on port ${config.port}`);
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      logger.error('Failed to start server', { error: err });
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
  void server.start();
}

export default Server;
