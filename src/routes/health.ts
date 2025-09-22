export default function registerHealth(server: any) {
  server.get('/health', async () => ({ status: 'ok' }));
  server.get('/', async () => ({ message: 'Hello from microservices-ai boilerplate' }));
}
