import Fastify, { type FastifyInstance } from 'fastify';

import config from './config';
import logger from './logger';
import runtime, { shouldAutoStartServer } from './runtime';

import { registerPlugins } from './plugins';
import { registerHooks } from './hooks';
import { registerErrorHandlers } from './errorHandlers';
import { registerAllRoutes } from './routes';
import { getRedisClient } from './plugins/redisClient';



export const configureServer = (app: FastifyInstance) => {
  registerPlugins(app);
  registerHooks(app);
  registerErrorHandlers(app);
  registerAllRoutes(app);
  return app;
};

export const buildServer = () => {
  const app = Fastify({
    logger: {
      level: config.logging.level,
      transport: config.logging.pretty
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    router: { ignoreTrailingSlash: true },
  });

  return configureServer(app);
};

const server = buildServer();

// Graceful shutdown logic
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await server.close();
  logger.debug('HTTP server closed.');

  const redis = getRedisClient();
  if (redis) {
    await redis.quit();
    logger.debug('Redis client disconnected.');
  }

  logger.info('Graceful shutdown complete.');
  process.exit(0);
};

// Error handling for uncaught exceptions
const handleError = (error: Error, signal: string) => {
  logger.fatal({ err: error }, `Caught ${signal}, forcing shutdown.`);
  process.exit(1);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (err) => handleError(err, 'uncaughtException'));
process.on('unhandledRejection', (reason) => handleError(reason as Error, 'unhandledRejection'));

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

export { server, start };
