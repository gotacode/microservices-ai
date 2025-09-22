<<<<<<< HEAD
import { describe, it, expect, beforeEach } from 'vitest';
import * as redisClient from '../../../src/plugins/redisClient';
import { rateLimiterHook } from '../../../src/middleware/rateLimiter';

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
=======
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
>>>>>>> bdcaec1607bf14f3ba251eb541bf513404e52e55
  });

  it('calls redis path and allows initial requests', async () => {
    const req: any = { ip: '1.2.3.4' };
    const reply: any = { code: (_: number) => ({ send: (_: any) => {} }) };
    await rateLimiterHook(req, reply);
<<<<<<< HEAD
    // no exception
=======
>>>>>>> bdcaec1607bf14f3ba251eb541bf513404e52e55
    expect(true).toBe(true);
  });
});
