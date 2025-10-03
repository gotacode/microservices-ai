
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';

describe('GET /metrics - Failure Path', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    vi.resetModules();

    // Mock the default export of 'prom-client'
    vi.doMock('prom-client', () => ({
      default: {
        Registry: class MockRegistry {
          collectDefaultMetrics() {}
          async metrics() {
            throw new Error('mocked metrics collection error');
          }
        },
        // The source code also calls the top-level collectDefaultMetrics
        collectDefaultMetrics: () => {},
      },
    }));

    // Dynamically import the server builder *after* the mock is in place
    const { buildServer } = await import('../support/server');
    server = buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return 500 with an error message when metrics collection fails', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'could not collect metrics' });
  });
});
