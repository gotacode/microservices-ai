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
    jwtAudience: string;
    jwtIssuer: string;
  };
  rateLimit: {
    max: number;
    windowSeconds: number;
  };
  redis: {
    url?: string;
  };
  http: {
    requestIdHeader: string;
    cors: {
      enabled: boolean;
      origin: string[];
      methods: string[];
      allowCredentials: boolean;
    };
    compression: {
      enabled: boolean;
      minLength: number;
    };
    security: {
      enabled: boolean;
    };
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

const toStringArray = (value: string | undefined, fallback: string[]) => {
  if (!value) {
    return fallback;
  }
  const arr = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  return arr.length > 0 ? arr : fallback;
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
      jwtAudience: process.env.JWT_AUDIENCE ?? 'urn:microservices-ai:api',
      jwtIssuer: process.env.JWT_ISSUER ?? 'urn:microservices-ai:auth',
    },
    rateLimit: {
      max: toNumber(process.env.RATE_LIMIT_MAX, 100),
      windowSeconds: toNumber(process.env.RATE_LIMIT_WINDOW_SEC, 60),
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    http: {
      requestIdHeader: process.env.HTTP_REQUEST_ID_HEADER ?? 'x-request-id',
      cors: {
        enabled: toBoolean(process.env.HTTP_CORS_ENABLED, true),
        origin: toStringArray(process.env.HTTP_CORS_ORIGIN, ['*']),
        methods: toStringArray(process.env.HTTP_CORS_METHODS, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
        allowCredentials: toBoolean(process.env.HTTP_CORS_ALLOW_CREDENTIALS, false),
      },
      compression: {
        enabled: toBoolean(process.env.HTTP_COMPRESSION_ENABLED, true),
        minLength: toNumber(process.env.HTTP_COMPRESSION_MIN_LENGTH, 1024),
      },
      security: {
        enabled: toBoolean(process.env.HTTP_SECURITY_HEADERS_ENABLED, true),
      },
    },
  };
};

const config = loadConfig();

export default config;