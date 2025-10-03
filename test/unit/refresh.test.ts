
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the logger to prevent test logs from cluttering the output
vi.mock('../../src/logger', () => ({
  default: {
    child: () => ({
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    }),
  },
}));

describe('Refresh Token Store', () => {
  const redisMock = {
    setex: vi.fn(),
    get: vi.fn(),
  };

  beforeEach(() => {
    vi.resetModules(); // Isolate each test
    redisMock.setex.mockClear();
    redisMock.get.mockClear();
  });

  describe('With Redis Client', () => {
    it('should store a refresh token in Redis', async () => {
      vi.doMock('../../src/plugins/redisClient', () => ({
        __getRedisClient: () => redisMock, // Correctly mock the property on the module namespace
      }));
      const { storeRefreshToken } = await import('../../src/stores/refresh');

      await storeRefreshToken('my-token', 'my-user');
      const expectedExpirySeconds = 60 * 60 * 24 * 7;
      expect(redisMock.setex).toHaveBeenCalledWith(
        'refresh:my-token',
        expectedExpirySeconds,
        JSON.stringify({ username: 'my-user' })
      );
    });

    it('should validate a valid token from Redis', async () => {
      redisMock.get.mockResolvedValue(JSON.stringify({ username: 'my-user' }));
      vi.doMock('../../src/plugins/redisClient', () => ({
        __getRedisClient: () => redisMock,
      }));
      const { validateRefreshToken } = await import('../../src/stores/refresh');

      const result = await validateRefreshToken('my-token');
      expect(redisMock.get).toHaveBeenCalledWith('refresh:my-token');
      expect(result).toEqual({ username: 'my-user' });
    });

    it('should return null for a non-existent token in Redis', async () => {
      redisMock.get.mockResolvedValue(null);
      vi.doMock('../../src/plugins/redisClient', () => ({
        __getRedisClient: () => redisMock,
      }));
      const { validateRefreshToken } = await import('../../src/stores/refresh');

      const result = await validateRefreshToken('non-existent-token');
      expect(result).toBeNull();
    });

    it('should return null for a malformed token in Redis', async () => {
      redisMock.get.mockResolvedValue('not-json');
      vi.doMock('../../src/plugins/redisClient', () => ({
        __getRedisClient: () => redisMock,
      }));
      const { validateRefreshToken } = await import('../../src/stores/refresh');

      const result = await validateRefreshToken('malformed-token');
      expect(result).toBeNull();
    });

    it('should return null if no token is provided', async () => {
      vi.doMock('../../src/plugins/redisClient', () => ({
        __getRedisClient: () => redisMock,
      }));
      const { validateRefreshToken } = await import('../../src/stores/refresh');

      const result = await validateRefreshToken('');
      expect(result).toBeNull();
    });
  });

  describe('Without Redis Client (In-Memory Fallback)', () => {
    it('should store a refresh token in memory', async () => {
      vi.doMock('../../src/plugins/redisClient', () => ({ __getRedisClient: () => null }));
      const { storeRefreshToken, __getRefreshMap } = await import('../../src/stores/refresh');
      __getRefreshMap().clear();

      await storeRefreshToken('mem-token', 'mem-user');
      const map = __getRefreshMap();
      expect(map.has('mem-token')).toBe(true);
      expect(map.get('mem-token')).toEqual(expect.objectContaining({ username: 'mem-user' }));
    });

    it('should validate a valid token from memory', async () => {
      vi.doMock('../../src/plugins/redisClient', () => ({ __getRedisClient: () => null }));
      const { storeRefreshToken, validateRefreshToken, __getRefreshMap } = await import('../../src/stores/refresh');
      __getRefreshMap().clear();

      await storeRefreshToken('mem-token', 'mem-user');
      const result = await validateRefreshToken('mem-token');
      expect(result).toEqual(expect.objectContaining({ username: 'mem-user' }));
    });

    it('should return null for a non-existent token in memory', async () => {
      vi.doMock('../../src/plugins/redisClient', () => ({ __getRedisClient: () => null }));
      const { validateRefreshToken, __getRefreshMap } = await import('../../src/stores/refresh');
      __getRefreshMap().clear();

      const result = await validateRefreshToken('non-existent-token');
      expect(result).toBeNull();
    });

    it('should return null for an expired token in memory', async () => {
      vi.useFakeTimers();
      vi.doMock('../../src/plugins/redisClient', () => ({ __getRedisClient: () => null }));
      const { storeRefreshToken, validateRefreshToken, __getRefreshMap } = await import('../../src/stores/refresh');
      __getRefreshMap().clear();

      await storeRefreshToken('exp-token', 'exp-user');
      
      // Advance time by 8 days, beyond the 7-day TTL
      vi.advanceTimersByTime(1000 * 60 * 60 * 24 * 8);

      const result = await validateRefreshToken('exp-token');
      expect(result).toBeNull();
      expect(__getRefreshMap().has('exp-token')).toBe(false);

      vi.useRealTimers();
    });
  });
});
