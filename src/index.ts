import Fastify, { type FastifyInstance } from 'fastify';

import config from './config';
import logger from './logger';
import runtime, { shouldAutoStartServer } from './runtime';

import { registerPlugins } from './plugins';
import { registerHooks } from './hooks';
import { registerErrorHandlers } from './errorHandlers';
import { registerAllRoutes } from './routes';



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
    },
    router: { ignoreTrailingSlash: true },
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

export { server, start };
