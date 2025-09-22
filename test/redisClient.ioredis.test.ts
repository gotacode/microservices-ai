import { describe, it, expect } from 'vitest';

describe('plugins/redisClient ioredis branch', () => {
  it('returns null when ioredis not available (already covered)', async () => {
    const orig = process.env.REDIS_URL;
    delete process.env.REDIS_URL;
    delete process.env.__TEST_IOREDIS;
    // dynamic import after env change
    const mod = await import('../src/plugins/redisClient');
    // call init helper if present
  if (mod.__initRedisClient) mod.__initRedisClient();
  const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeNull();
    process.env.REDIS_URL = orig;
  });

  it('creates a client when ioredis is mockable and REDIS_URL set', async () => {
    const orig = process.env.REDIS_URL;
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.__TEST_IOREDIS = '1';
    const mod = await import('../src/plugins/redisClient');
  if (mod.__initRedisClient) mod.__initRedisClient();
  const client = mod.__getRedisClient ? mod.__getRedisClient() : mod.default;
    expect(client).toBeTruthy();
    expect(client.url).toBe('redis://localhost:6379');
    process.env.REDIS_URL = orig;
    delete process.env.__TEST_IOREDIS;
  });
});
