import Fastify, { type FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';

import config from './config';
import logger from './logger';
import { rateLimiterHook } from './middleware/rateLimiter';
import registerHealth from './routes/health';
import registerReady from './routes/ready';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

const configureServer = (app: FastifyInstance) => {
  app.addHook('onRequest', (request, _reply, done) => {
    request.log.debug({ method: request.method, url: request.url }, 'incoming request');
    done();
  });
  app.addHook('onError', (request, _reply, error, done) => {
    request.log.error({ err: error }, 'request failed');
    done();
  });
  app.addHook('preHandler', rateLimiterHook as any);
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

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server, start, buildServer };
