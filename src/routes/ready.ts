import type { FastifyInstance } from 'fastify';

export default function registerReady(server: FastifyInstance) {
  server.get('/ready', async () => ({ status: 'ready' }));
}
