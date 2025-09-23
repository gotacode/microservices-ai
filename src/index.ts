import Fastify, { type FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';

import config from './config';
import logger from './logger';
import runtime, { shouldAutoStartServer } from './runtime';
import { getRedisClient } from './plugins/redisClient';
import registerHealth from './routes/health';
import registerReady from './routes/ready';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

const { http: httpConfig } = config;

const configureServer = (app: FastifyInstance) => {
  if (httpConfig.cors.enabled) {
    app.register(cors, {
      origin: httpConfig.cors.origin,
      methods: httpConfig.cors.methods,
      credentials: httpConfig.cors.allowCredentials,
    });
  }

  if (httpConfig.security.enabled) {
    app.register(helmet, { global: true });
  }

  if (httpConfig.compression.enabled) {
    app.register(compress, {
      global: true,
      encodings: ['br', 'gzip'],
      threshold: httpConfig.compression.minLength,
    });
  }

  // Register rate-limit plugin
  const redis = getRedisClient();
  app.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.windowSeconds * 1000, // plugin expects milliseconds
    redis: redis,
    keyGenerator: (request: any) => (request.ip || request.socket?.remoteAddress || 'anonymous') as string,
  });

  app.addHook('onError', (request, reply, error, done) => {
    request.log.error({ err: error }, 'request failed');
    reply.header(httpConfig.requestIdHeader, request.id ?? '');
    done();
  });

  app.addHook('onSend', (request, reply, payload, done) => {
    reply.header(httpConfig.requestIdHeader, request.id ?? '');
    done(null, payload);
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'unhandled error');
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    });
  });

  registerHealth(app);
  registerReady(app);
  registerMetrics(app);
  registerOpenAPI(app);
  registerLogin(app);
  registerAuth(app);
  return app;
};

const buildServer = () => {
  const app = Fastify({
    logger: {
      level: config.logging.level,
    },
    requestIdHeader: httpConfig.requestIdHeader,
    ...( { routerOptions: { ignoreTrailingSlash: true } } as any),
  });

  app.register(jwt, {
    secret: config.auth.jwtSecret,
    verify: {
      audience: config.auth.jwtAudience,
      issuer: config.auth.jwtIssuer,
    },
  });

  return configureServer(app);
};

const server = buildServer();

const start = async () => {
  try {
    const { port, host } = config.server;
    logger.info({ port, host }, 'Starting Fastify server');
    await server.listen({ port, host });
    logger.info({ port, host }, 'Server listening');
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

if (shouldAutoStartServer()) {
  logger.debug({ runtime: runtime.target }, 'Auto starting HTTP server');
  start();
}

export { server, start, buildServer };
