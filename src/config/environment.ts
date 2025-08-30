import dotenv from 'dotenv';
import Joi from 'joi';

// Load env variables
dotenv.config();

// Env validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(3600000), // 1 hour in ms
  ENABLE_CORS: Joi.boolean().default(true),
  CORS_ORIGIN: Joi.string().default('*'),
  MAX_REQUEST_SIZE: Joi.string().default('10mb'),
  ENABLE_HELMET: Joi.boolean().default(true),
  JWT_SECRET: Joi.string().default('your-secret-key-change-in-production'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),
}).unknown();

// Validate env variables
const { error, value: envVars } = envSchema.validate(process.env) as {
  error: Joi.ValidationError | undefined;
  value: {
    NODE_ENV: string;
    PORT: number;
    LOG_LEVEL: string;
    RATE_LIMIT_WINDOW_MS: number;
    ENABLE_CORS: boolean;
    CORS_ORIGIN: string;
    MAX_REQUEST_SIZE: string;
    ENABLE_HELMET: boolean;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    BCRYPT_SALT_ROUNDS: number;
  };
};

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  logging: {
    level: string;
  };
  rateLimit: {
    windowMs: number;
  };
  cors: {
    enabled: boolean;
    origin: string;
  };
  security: {
    maxRequestSize: string;
    enableHelmet: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptSaltRounds: number;
  };
}

const config: EnvironmentConfig = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  logging: {
    level: envVars.LOG_LEVEL,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
  },
  cors: {
    enabled: envVars.ENABLE_CORS,
    origin: envVars.CORS_ORIGIN,
  },
  security: {
    maxRequestSize: envVars.MAX_REQUEST_SIZE,
    enableHelmet: envVars.ENABLE_HELMET,
  },
  auth: {
    jwtSecret: envVars.JWT_SECRET,
    jwtExpiresIn: envVars.JWT_EXPIRES_IN,
    bcryptSaltRounds: envVars.BCRYPT_SALT_ROUNDS,
  },
};

export default config;
