import { describe, it, expect } from 'vitest';

describe('refresh store with redis client', () => {
  it('stores and retrieves via fake redis client', async () => {
    const mod = await import('../src/plugins/redisClient');
    const refresh = await import('../src/stores/refresh');
    // create fake redis client that records set/get
    const store: Record<string, string> = {};
    const fake = {
      setex: async (k: string, ttl: number, v: string) => {
        store[k] = v;
      },
      get: async (k: string) => store[k] || null,
    } as any;
    if (mod.__setRedisClient) mod.__setRedisClient(fake);
    // call storeRefreshToken
    await refresh.storeRefreshToken('r1', 'bob');
    const v = await refresh.validateRefreshToken('r1');
    expect(v).toEqual({ username: 'bob' });
  });
});
