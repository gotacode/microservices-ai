import type { FastifyInstance } from 'fastify';

export default function registerHealth(server: FastifyInstance) {
  server.get('/health', async (request) => {
    request.log.debug('healthcheck requested');
    return { status: 'ok' };
  });
  server.get('/', async (request) => {
    request.log.debug('root route requested');
    return { message: 'Hello from microservices-ai boilerplate' };
  });
}
