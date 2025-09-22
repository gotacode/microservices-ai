import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export default function registerMetrics(server: any) {
  server.get('/metrics', async (_req: any, reply: any) => {
    try {
      const metrics = await registry.metrics();
      reply.type('text/plain; version=0.0.4').send(metrics);
    } catch {
      reply.code(500).send({ error: 'could not collect metrics' });
    }
  });
}
