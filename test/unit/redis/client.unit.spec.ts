import { describe, it, expect, vi } from 'vitest';

describe('plugins/redisClient plugin', () => {
  it('falls back to null when ioredis is not available and no REDIS_URL', async () => {
    vi.resetModules();
    const origUrl = process.env.REDIS_URL;
    const origTest = process.env.__TEST_IOREDIS;
    delete process.env.REDIS_URL;
    delete process.env.__TEST_IOREDIS;

    const mod = await import('../../../src/plugins/redisClient');
    if (mod.__initRedisClient) {
      mod.__initRedisClient();
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeNull();

    process.env.REDIS_URL = origUrl as any;
    process.env.__TEST_IOREDIS = origTest as any;
  });

  it('returns a mock client when __TEST_IOREDIS=1 and respects REDIS_URL', async () => {
    vi.resetModules();
    const origUrl = process.env.REDIS_URL;
    const origTest = process.env.__TEST_IOREDIS;
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.__TEST_IOREDIS = '1';

    const mod = await import('../../../src/plugins/redisClient');
    if (mod.__initRedisClient) {
      mod.__initRedisClient();
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeTruthy();
    expect(client.url).toBe('redis://localhost:6379');

    // restore
    process.env.REDIS_URL = origUrl as any;
    process.env.__TEST_IOREDIS = origTest as any;
  });

  it('allows direct injection via __setRedisClient', async () => {
    vi.resetModules();
    const mod = await import('../../../src/plugins/redisClient');
    const fake: any = { get: async () => null, setex: async () => {}, incr: async () => 1, expire: async () => {} };
    if (mod.__setRedisClient) {
      mod.__setRedisClient(fake);
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBe(fake);
  });
});

