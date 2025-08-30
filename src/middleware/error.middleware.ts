import { Request, Response, NextFunction } from 'express';
import logger, { LogContext } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = Array.isArray(req.headers['x-request-id'])
    ? req.headers['x-request-id'][0]
    : req.headers['x-request-id'];

  const logContext: LogContext = {
    error,
    method: req.method,
    url: req.url,
    ...(requestId && { requestId }),
    ...(req.ip && { ip: req.ip }),
  };

  logger.error('Unhandled error', logContext);

  // Don't send error details in production
  const isDevelopment = process.env['NODE_ENV'] === 'development';

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDevelopment && {
      details: error.message,
      stack: error.stack,
    }),
    meta: {
      timestamp: new Date().toISOString(),
      requestId: requestId || 'unknown',
      version: '1.0.0',
    },
  });
};
