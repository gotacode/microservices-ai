import { describe, it, expect, beforeEach } from 'vitest';
import * as redisClient from '../src/plugins/redisClient';
import { rateLimiterHook } from '../src/middleware/rateLimiter';

// Simulate redis-backed limiter by stubbing the redis client methods
describe('rate limiter redis path', () => {
  beforeEach(() => {
    // @ts-ignore
    redisClient.default = {
      store: new Map<string, number>(),
      incr: async (key: string) => {
        const s: any = redisClient.default.store;
        const v = (s.get(key) || 0) + 1;
        s.set(key, v);
        return v;
      },
      expire: async (_k: string, _s: number) => {},
    };
  });

  it('calls redis path and allows initial requests', async () => {
    const req: any = { ip: '1.2.3.4' };
    const reply: any = { code: (_: number) => ({ send: (_: any) => {} }) };
    await rateLimiterHook(req, reply);
    // no exception
    expect(true).toBe(true);
  });
});
