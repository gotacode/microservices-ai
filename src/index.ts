import Fastify from 'fastify';
import dotenv from 'dotenv';
import jwt from '@fastify/jwt';

// Load .env in dev
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const server = Fastify({
  logger: true,
  // Fastify v5: router options moved; cast to any to satisfy runtime requirement
  ...( { routerOptions: { ignoreTrailingSlash: true } } as any),
});

// register jwt
const jwtSecret = process.env.JWT_SECRET || 'changeme';
server.register(jwt, { secret: jwtSecret });

// register middleware and routes
import { rateLimiterHook } from './middleware/rateLimiter';
import registerHealth from './routes/health';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

server.addHook('preHandler', rateLimiterHook as any);
registerHealth(server);
registerMetrics(server);
registerOpenAPI(server);
registerLogin(server);
registerAuth(server);

const start = async () => {
  try {
    const port = Number(process.env.PORT || 3000);
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server, start };
