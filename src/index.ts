import Fastify, { type FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { randomUUID } from 'node:crypto';

import config from './config';
import logger from './logger';
import runtime, { shouldAutoStartServer } from './runtime';
import { rateLimiterHook } from './middleware/rateLimiter';
import registerHealth from './routes/health';
import registerReady from './routes/ready';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

const { http: httpConfig } = config;

const optionalPlugin = (name: string) => {
  try {
    /* istanbul ignore next */
    return require(name);
  } catch (error) {
    /* istanbul ignore next */
    logger.debug({ plugin: name, err: error }, 'optional fastify plugin not available, skipping');
    return null;
  }
};

const configureServer = (app: FastifyInstance) => {
  const requestIdPlugin = optionalPlugin('@fastify/request-id');
  /* istanbul ignore if */
  if (requestIdPlugin) {
    app.register(requestIdPlugin, {
      headerName: httpConfig.requestIdHeader,
    });
  }

  const corsPlugin = optionalPlugin('@fastify/cors');
  /* istanbul ignore next */
  if (corsPlugin && httpConfig.cors.enabled) {
    app.register(corsPlugin, {
      origin: httpConfig.cors.origin,
      methods: httpConfig.cors.methods,
      credentials: httpConfig.cors.allowCredentials,
    });
  }

  const helmetPlugin = optionalPlugin('@fastify/helmet');
  /* istanbul ignore next */
  if (helmetPlugin && httpConfig.security.enabled) {
    app.register(helmetPlugin, { global: true });
  }

  const compressPlugin = optionalPlugin('@fastify/compress');
  /* istanbul ignore next */
  if (compressPlugin && httpConfig.compression.enabled) {
    app.register(compressPlugin, {
      global: true,
      encodings: ['gzip'],
      threshold: httpConfig.compression.minLength,
    });
  }

  app.addHook('onRequest', (request, _reply, done) => {
    request.log.debug({ method: request.method, url: request.url }, 'incoming request');
    done();
  });

  app.addHook('onError', (request, reply, error, done) => {
    request.log.error({ err: error }, 'request failed');
    reply.header(httpConfig.requestIdHeader, request.id ?? '');
    done();
  });

  app.addHook('preHandler', rateLimiterHook as any);

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
    genReqId: (req) => {
      const headerValue = req.headers[httpConfig.requestIdHeader] as string | undefined;
      return headerValue ?? randomUUID();
    },
    ...( { routerOptions: { ignoreTrailingSlash: true } } as any),
  });

  app.register(jwt, { secret: config.auth.jwtSecret });

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
