import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
type LogLevel = typeof LOG_LEVELS[number];

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_NAME: z.string().default('microservices-ai'),
  LOG_LEVEL: z.preprocess(
    (val) => (LOG_LEVELS as readonly string[]).includes(String(val)) ? String(val) : undefined,
    z.enum(LOG_LEVELS).optional(),
  ),
  LOG_PRETTY: z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined;
      return String(val).toLowerCase() === 'true' || String(val) === '1';
    },
    z.boolean().optional(),
  ),

  PORT: z.preprocess(
    (val) => {
      const num = Number(val);
      return (val === undefined || val === '' || isNaN(num)) ? undefined : num;
    },
    z.number().int().positive().optional(),
  ),
  HOST: z.string().default('0.0.0.0'),

  AUTH_USER: z.string().default('admin'),
  AUTH_PASS: z.string().default('password'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long')
    .refine((val) => val !== 'changeme', 'JWT_SECRET must be changed from default value'),
  JWT_AUDIENCE: z.string().default('urn:microservices-ai:api'),
  JWT_ISSUER: z.string().default('urn:microservices-ai:auth'),

  RATE_LIMIT_MAX: z.preprocess(
    (val) => {
      const num = Number(val);
      return (val === undefined || val === '' || isNaN(num)) ? undefined : num;
    },
    z.number().int().positive().optional(),
  ),
  RATE_LIMIT_WINDOW_SEC: z.preprocess(
    (val) => {
      const num = Number(val);
      return (val === undefined || val === '' || isNaN(num)) ? undefined : num;
    },
    z.number().int().positive().optional(),
  ),

  REDIS_URL: z.string().url().optional(),

  HTTP_REQUEST_ID_HEADER: z.string().default('x-request-id'),
  HTTP_CORS_ENABLED: z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined;
      return String(val).toLowerCase() === 'true' || String(val) === '1';
    },
    z.boolean().optional(),
  ),
  HTTP_CORS_ORIGIN: z.preprocess(
    (val) => {
      const arr = typeof val === 'string' ? val.split(',').map((v) => v.trim()).filter(Boolean) : [];
      return arr.length > 0 ? arr : undefined;
    },
    z.array(z.string()).optional(),
  ),
  HTTP_CORS_METHODS: z.preprocess(
    (val) => {
      const arr = typeof val === 'string' ? val.split(',').map((v) => v.trim()).filter(Boolean) : [];
      return arr.length > 0 ? arr : undefined;
    },
    z.array(z.string()).optional(),
  ),
  HTTP_CORS_ALLOW_CREDENTIALS: z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined;
      return String(val).toLowerCase() === 'true' || String(val) === '1';
    },
    z.boolean().optional(),
  ),

  HTTP_COMPRESSION_ENABLED: z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined;
      return String(val).toLowerCase() === 'true' || String(val) === '1';
    },
    z.boolean().optional(),
  ),
  HTTP_COMPRESSION_MIN_LENGTH: z.preprocess(
    (val) => {
      const num = Number(val);
      return (val === undefined || val === '' || isNaN(num)) ? undefined : num;
    },
    z.number().int().nonnegative().optional(),
  ),

  HTTP_SECURITY_HEADERS_ENABLED: z.preprocess(
    (val) => {
      if (val === undefined || val === '') return undefined;
      return String(val).toLowerCase() === 'true' || String(val) === '1';
    },
    z.boolean().optional(),
  ),
});

export type AppConfig = z.infer<typeof envSchema>;

export const loadConfig = (): AppConfig => {
  const parsedEnv = envSchema.parse(process.env);

  const isProduction = parsedEnv.NODE_ENV === 'production';
  const defaultLogLevel: LogLevel = isProduction ? 'info' : 'debug';

  return {
    appName: parsedEnv.APP_NAME,
    nodeEnv: parsedEnv.NODE_ENV,
    isProduction,
    logging: {
      level: parsedEnv.LOG_LEVEL ?? defaultLogLevel,
      pretty: parsedEnv.LOG_PRETTY ?? !isProduction,
    },
    server: {
      port: parsedEnv.PORT ?? 3000,
      host: parsedEnv.HOST,
    },
    auth: {
      user: parsedEnv.AUTH_USER,
      pass: parsedEnv.AUTH_PASS,
      jwtSecret: parsedEnv.JWT_SECRET,
      jwtAudience: parsedEnv.JWT_AUDIENCE,
      jwtIssuer: parsedEnv.JWT_ISSUER,
    },
    rateLimit: {
      max: parsedEnv.RATE_LIMIT_MAX ?? 100,
      windowSeconds: parsedEnv.RATE_LIMIT_WINDOW_SEC ?? 60,
    },
    redis: {
      url: parsedEnv.REDIS_URL,
    },
    http: {
      requestIdHeader: parsedEnv.HTTP_REQUEST_ID_HEADER,
      cors: {
        enabled: parsedEnv.HTTP_CORS_ENABLED ?? true,
        origin: parsedEnv.HTTP_CORS_ORIGIN ?? ['*'],
        methods: parsedEnv.HTTP_CORS_METHODS ?? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowCredentials: parsedEnv.HTTP_CORS_ALLOW_CREDENTIALS ?? false,
      },
      compression: {
        enabled: parsedEnv.HTTP_COMPRESSION_ENABLED ?? true,
        minLength: parsedEnv.HTTP_COMPRESSION_MIN_LENGTH ?? 1024,
      },
      security: {
        enabled: parsedEnv.HTTP_SECURITY_HEADERS_ENABLED ?? true,
      },
    },
  };
};

const config = loadConfig();

export default config;