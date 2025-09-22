export default function registerOpenAPI(server: any) {
  server.get('/openapi.json', async () => ({
    openapi: '3.0.0',
    info: { title: 'microservices-ai API', version: '0.0.0' },
    paths: {
      '/': { get: { responses: { '200': { description: 'OK' } } } },
      '/health': { get: { responses: { '200': { description: 'OK' } } } },
      '/metrics': { get: { responses: { '200': { description: 'Prometheus metrics' } } } },
      '/protected': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Protected' }, '401': { description: 'Unauthorized' } } } },
    },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
  }));
}
