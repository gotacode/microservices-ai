import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('refresh store - redis error handling', () => {
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

  it('handles redis initialization failures gracefully', async () => {
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
  });

  it('falls back to in-memory when redis get/set fails', async () => {
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
