import type { FastifyInstance } from 'fastify';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export default function registerMetrics(server: FastifyInstance) {
  server.get('/metrics', async (request: any, reply: any) => {
    try {
      const metrics = await registry.metrics();
      request.log.debug('metrics collected successfully');
      reply.type('text/plain; version=0.0.4').send(metrics);
    } catch {
      request.log.error('failed to collect metrics');
      reply.code(500).send({ error: 'could not collect metrics' });
    }
  });
}
