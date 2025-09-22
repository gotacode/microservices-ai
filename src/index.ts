import Fastify from 'fastify';

const server = Fastify({
  logger: true,
  // Fastify v5: router options moved; cast to any to satisfy runtime requirement
  ...( { routerOptions: { ignoreTrailingSlash: true } } as any),
});

server.get('/health', async () => ({ status: 'ok' }));

server.get('/', async () => ({ message: 'Hello from microservices-ai boilerplate' }));

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

export { server };
