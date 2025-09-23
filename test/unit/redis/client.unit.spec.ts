import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('plugins/redisClient plugin', () => {
  let origRedisUrl: string | undefined;
  let origTestIoredis: string | undefined;

  beforeEach(() => {
    origRedisUrl = process.env.REDIS_URL;
    origTestIoredis = process.env.__TEST_IOREDIS;
    process.env.REDIS_URL = 'redis://localhost:6379'; // Ensure a valid URL is set for config loading
    process.env.__TEST_IOREDIS = '1'; // Ensure ioredis is mocked for these tests
  });

  afterEach(() => {
    process.env.REDIS_URL = origRedisUrl;
    process.env.__TEST_IOREDIS = origTestIoredis;
    vi.resetModules(); // Reset modules to ensure fresh imports for each test
  });

  it('falls back to null when ioredis is not available and no REDIS_URL', async () => {
    delete process.env.REDIS_URL;
    delete process.env.__TEST_IOREDIS;

    const mod = await import('../../../src/plugins/redisClient');
    if (mod.__initRedisClient) {
      mod.__initRedisClient();
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeNull();
  });

  it('returns a mock client when __TEST_IOREDIS=1 and respects REDIS_URL', async () => {
    const mod = await import('../../../src/plugins/redisClient');
    if (mod.__initRedisClient) {
      mod.__initRedisClient();
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeTruthy();
    expect(client.url).toBe('redis://localhost:6379');
  });

  it('allows direct injection via __setRedisClient', async () => {
    const mod = await import('../../../src/plugins/redisClient');
    const fake: any = { get: async () => null, setex: async () => {}, incr: async () => 1, expire: async () => {} };
    if (mod.__setRedisClient) {
      mod.__setRedisClient(fake);
    }
    const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBe(fake);
  });
});

