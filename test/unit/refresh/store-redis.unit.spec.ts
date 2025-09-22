import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('refresh store - redis-backed', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('stores and retrieves refresh token using injected fake redis client', async () => {
    const rc = await import('../../../src/plugins/redisClient');
    const fake: any = {
      storage: new Map<string, string>(),
      async setex(k: string, _ttl: number, v: string) {
        this.storage.set(k, v);
      },
      async get(k: string) {
        return this.storage.get(k) || null;
      },
    };
    if (rc.__setRedisClient) {
      rc.__setRedisClient(fake);
    }

    const refresh = await import('../../../src/stores/refresh');
    await refresh.storeRefreshToken('r1', 'carol');
    const v = await refresh.validateRefreshToken('r1');
    expect(v).toBeTruthy();
    expect((v as any).username).toBe('carol');
  });
});

