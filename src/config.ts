import dotenv from 'dotenv';

dotenv.config();

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

type AppConfig = {
  appName: string;
  nodeEnv: string;
  isProduction: boolean;
  logging: {
    level: LogLevel;
    pretty: boolean;
  };
  server: {
    port: number;
    host: string;
  };
  auth: {
    user: string;
    pass: string;
    jwtSecret: string;
  };
  rateLimit: {
    max: number;
    windowSeconds: number;
  };
  redis: {
    url?: string;
  };
};

const LOG_LEVELS: LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }
  return value === 'true' || value === '1';
};

const toLogLevel = (value: string | undefined, fallback: LogLevel): LogLevel => {
  if (!value) {
    return fallback;
  }
  return LOG_LEVELS.includes(value as LogLevel) ? (value as LogLevel) : fallback;
};

export const loadConfig = (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isProduction = nodeEnv === 'production';
  const defaultLogLevel: LogLevel = isProduction ? 'info' : 'debug';

  return {
    appName: process.env.APP_NAME ?? 'microservices-ai',
    nodeEnv,
    isProduction,
    logging: {
      level: toLogLevel(process.env.LOG_LEVEL, defaultLogLevel),
      pretty: toBoolean(process.env.LOG_PRETTY, !isProduction),
    },
    server: {
      port: toNumber(process.env.PORT, 3000),
      host: process.env.HOST ?? '0.0.0.0',
    },
    auth: {
      user: process.env.AUTH_USER ?? 'admin',
      pass: process.env.AUTH_PASS ?? 'password',
      jwtSecret: process.env.JWT_SECRET ?? 'changeme',
    },
    rateLimit: {
      max: toNumber(process.env.RATE_LIMIT_MAX, 100),
      windowSeconds: toNumber(process.env.RATE_LIMIT_WINDOW_SEC, 60),
    },
    redis: {
      url: process.env.REDIS_URL,
    },
  };
};

const config = loadConfig();

export default config;
