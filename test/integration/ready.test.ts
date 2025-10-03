
import { describe, it, expect, afterEach, vi } from 'vitest';
import { type FastifyInstance } from 'fastify';

// Helper function to build a server with a specific mock for the redis client
const buildServerWithMock = async (redisMock: any) => {
  vi.resetModules();

  vi.doMock('../../src/plugins/redisClient', () => ({
    getRedisClient: redisMock,
  }));

  const { buildServer } = await import('../support/server');
  return buildServer();
};

describe('GET /ready', () => {
  let server: FastifyInstance;

  afterEach(async () => {
    await server.close();
  });

  it('should return 200 and ready status when redis is disabled', async () => {
    const getRedisClientMock = vi.fn().mockReturnValue(null);
    server = await buildServerWithMock(getRedisClientMock);

    const response = await server.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready', redis: 'disabled' });
  }, 10000);

  it('should return 200 and ready status when redis ping is successful', async () => {
    const mockRedisClient = { ping: async () => 'PONG', defineCommand: vi.fn() };
    const getRedisClientMock = vi.fn().mockReturnValue(mockRedisClient);
    server = await buildServerWithMock(getRedisClientMock);

    const response = await server.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready', redis: 'ready' });
  });

  it('should return 503 when redis ping returns an unexpected response', async () => {
    const mockRedisClient = { ping: async () => 'OK', defineCommand: vi.fn() };
    const getRedisClientMock = vi.fn().mockReturnValue(mockRedisClient);
    server = await buildServerWithMock(getRedisClientMock);

    const response = await server.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'not ready', redis: 'unhealthy' });
  });

  it('should return 503 when redis ping throws an error', async () => {
    const mockRedisClient = { ping: async () => { throw new Error('Redis down'); }, defineCommand: vi.fn() };
    const getRedisClientMock = vi.fn().mockReturnValue(mockRedisClient);
    server = await buildServerWithMock(getRedisClientMock);

    const response = await server.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'not ready', redis: 'error' });
  });
});
