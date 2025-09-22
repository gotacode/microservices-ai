import Fastify, { type FastifyInstance } from 'fastify';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';

// Load .env in dev
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { rateLimiterHook } from './middleware/rateLimiter';
import registerHealth from './routes/health';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

const configureServer = (app: FastifyInstance) => {
  app.addHook('preHandler', rateLimiterHook as any);
  registerHealth(app);
  registerMetrics(app);
  registerOpenAPI(app);
  registerLogin(app);
  registerAuth(app);
  return app;
};

const buildServer = () => {
  const app = Fastify({
    logger: true,
    // Fastify v5: router options moved; cast to any to satisfy runtime requirement
    ...( { routerOptions: { ignoreTrailingSlash: true } } as any),
  });

  const jwtSecret = process.env.JWT_SECRET || 'changeme';
  app.register(jwt, { secret: jwtSecret });

  return configureServer(app);
};

const server = buildServer();

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3000);
    const host = process.env.HOST || '0.0.0.0';
    await server.listen({ port, host });
    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server, start, buildServer };
