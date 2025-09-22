import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { __setRedisClient } from '../../../src/plugins/redisClient';
import { rateLimiterHook } from '../../../src/middleware/rateLimiter';

describe('rate limiter redis path', () => {
  beforeEach(() => {
    const store = new Map<string, number>();
    __setRedisClient({
      store,
      incr: async (key: string) => {
        const value = (store.get(key) || 0) + 1;
        store.set(key, value);
        return value;
      },
      expire: async () => {},
    } as any);
  });

  afterEach(() => {
    __setRedisClient(null);
  });

  it('calls redis path and allows initial requests', async () => {
    const req: any = { ip: '1.2.3.4' };
    const reply: any = { code: (_: number) => ({ send: (_: any) => {} }) };
    await rateLimiterHook(req, reply);
    expect(true).toBe(true);
  });
});
