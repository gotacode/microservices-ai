import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { buildServer } from '../support/server';

describe('GET /metrics', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return 200 with prometheus metrics', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/plain; version=0.0.4');
    expect(response.payload).toContain('process_cpu_user_seconds_total');
  });
});