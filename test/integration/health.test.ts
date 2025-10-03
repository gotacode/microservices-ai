
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { buildServer } from '../support/server';

describe('Health and Root Routes', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    // We are not calling await server.ready() to ensure we test the server as it is
    // without waiting for all plugins to be loaded.
    // This is a good practice for health checks, as they should be available early.
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return 200 with status: ok on /health', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('should return 200 with a welcome message on the root route', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'Hello from microservices-ai boilerplate' });
  });
});
