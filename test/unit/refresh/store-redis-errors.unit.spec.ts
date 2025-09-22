import { describe, it, expect, vi } from 'vitest';

describe('refresh store - redis error handling', () => {
  it('handles redis initialization failures gracefully', async () => {
    vi.resetModules();
    const origUrl = process.env.REDIS_URL;
    process.env.REDIS_URL = 'redis://localhost:6379';
    process.env.__TEST_IOREDIS = '1';

    const { __setRedisClient } = await import('../../../src/plugins/redisClient');
    const fake = {
      setex: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
      get: vi.fn().mockRejectedValue(new Error('Redis connection failed')),
    };
    if (__setRedisClient) {
      __setRedisClient(fake);
    }

    const refresh = await import('../../../src/stores/refresh');
    await expect(refresh.storeRefreshToken('tok1', 'alice')).rejects.toThrow('Redis connection failed');

    expect(fake.setex).toHaveBeenCalledWith(
      'refresh:tok1',
      expect.any(Number),
      expect.stringContaining('alice'),
    );

    process.env.REDIS_URL = origUrl;
    delete process.env.__TEST_IOREDIS;
  });

  it('falls back to in-memory when redis get/set fails', async () => {
    vi.resetModules();
    const { __setRedisClient } = await import('../../../src/plugins/redisClient');
    if (__setRedisClient) {
      __setRedisClient(null);
    }

    const refresh = await import('../../../src/stores/refresh');
    const map = refresh.__getRefreshMap();
    if (map) {
      map.clear();
    }

    await refresh.storeRefreshToken('tok2', 'bob');
    const result = await refresh.validateRefreshToken('tok2');
    expect(result).toBeTruthy();
    expect(result?.username).toBe('bob');
  });

  it('handles malformed data in redis gracefully', async () => {
    vi.resetModules();
    const { __setRedisClient } = await import('../../../src/plugins/redisClient');
    const fake = {
      setex: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue('{"malformed json'),
    };
    if (__setRedisClient) {
      __setRedisClient(fake);
    }

    const refresh = await import('../../../src/stores/refresh');
    const result = await refresh.validateRefreshToken('bad-json');
    expect(result).toBeNull();
  });
});
