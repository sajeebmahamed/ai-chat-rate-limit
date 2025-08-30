import config from '../config/environment';
import winston from 'winston';

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, stack, ...meta } = info;
    let log = `${String(timestamp)} [${String(level).toUpperCase()}]: ${String(message)}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    if (stack && typeof stack === 'string') {
      log += `\n${stack}`;
    }

    return log;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss',
  }),
  winston.format.printf((info: winston.Logform.TransformableInfo) => {
    const { level, message, timestamp, ...meta } = info;
    let log = `${String(timestamp)} ${String(level)}: ${String(message)}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create transports based on env
const transports: winston.transport[] = [];

// console transports
if (config.nodeEnv === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: customFormat,
      level: config.logging.level,
    })
  );
}

// File transports for production
if (config.nodeEnv === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const winstonLogger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  defaultMeta: {
    service: 'ai-chat-rate-limiter',
    environment: config.nodeEnv,
  },
  transports,
  exitOnError: false,
});

// Add request correlation ID support
export interface LogContext {
  requestId?: string;
  userId?: string;
  userType?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  error?: Error;
  nodeEnv?: string;
  corsEnabled?: boolean;
  helmetEnabled?: boolean;
  promise?: Promise<unknown>;
}

class Logger {
  private winston: winston.Logger;

  constructor(winstonLogger: winston.Logger) {
    this.winston = winstonLogger;
  }

  private formatMessage(message: string, context?: LogContext): [string, LogContext] {
    const meta: LogContext = { ...context };

    if (context?.requestId) {
      message = `[${context.requestId}] ${message}`;
      delete meta.requestId;
    }

    return [message, meta];
  }

  debug(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.winston.debug(msg, meta);
  }

  info(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.winston.info(msg, meta);
  }

  warn(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.winston.warn(msg, meta);
  }

  error(message: string, context?: LogContext): void {
    const [msg, meta] = this.formatMessage(message, context);
    this.winston.error(msg, meta);
  }
}

// Export singleton instance
export const logger = new Logger(winstonLogger);

// Export class for DI
export { Logger };

export default logger;
