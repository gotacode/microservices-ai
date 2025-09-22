import { describe, it, expect, vi } from 'vitest';

describe('rate limiter (in-memory) - dynamic import', () => {
  it('returns 429 after exceeding limit (default max)', async () => {
    const origMax = process.env.RATE_LIMIT_MAX;
    process.env.RATE_LIMIT_MAX = '3';
    try {
      // ensure fresh module evaluation so RATE_LIMIT_MAX is read from env for this test
      vi.resetModules();
      // Ensure plugin client is null so in-memory branch is used
      const rc = await import('../../../src/plugins/redisClient');
      if (rc.__setRedisClient) {
        rc.__setRedisClient(null);
      }
      // import rateLimiter after resetting modules and plugin state
      const mod = await import('../../../src/middleware/rateLimiter');
      if (mod.__resetRateMap) {
        mod.__resetRateMap();
      }
      const rateLimiterHook = mod.rateLimiterHook as any;

      const req: any = { ip: '1.2.3.4' };
      let replyStatus: number | null = null;
      const reply: any = { code: (s: number) => ({ send: (_body: any) => { replyStatus = s; } }) };

      const max = Number(process.env.RATE_LIMIT_MAX || 3);
      for (let i = 0; i < max + 1; i++) {
        await rateLimiterHook(req, reply);
      }
      expect(replyStatus).toBe(429);
    } finally {
      process.env.RATE_LIMIT_MAX = origMax;
    }
  });

  it('responds with 429 after exceeding custom limit', async () => {
    const origMax = process.env.RATE_LIMIT_MAX;
    process.env.RATE_LIMIT_MAX = '2';
    try {
      vi.resetModules();
      const rc = await import('../../../src/plugins/redisClient');
      if (rc.__setRedisClient) {
        rc.__setRedisClient(null);
      }
      const mod = await import('../../../src/middleware/rateLimiter');
      if (mod.__resetRateMap) {
        mod.__resetRateMap();
      }
      const rateLimiterHook = mod.rateLimiterHook as any;

      const req: any = { ip: '2.3.4.5' };
      const responses: any[] = [];
      const reply: any = { code: (c: number) => ({ send: (_body: any) => responses.push({ c, body: _body }) }) };

      await rateLimiterHook(req, reply);
      await rateLimiterHook(req, reply);
      await rateLimiterHook(req, reply);

      expect(responses.length).toBeGreaterThanOrEqual(1);
      const last = responses[responses.length - 1];
      expect(last.c).toBe(429);
    } finally {
      process.env.RATE_LIMIT_MAX = origMax;
    }
  });
});
