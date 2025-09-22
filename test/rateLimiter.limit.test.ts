import { describe, it, expect } from 'vitest';

describe('rate limiter limit', () => {
  it('responds with 429 after exceeding limit in memory mode', async () => {
    const origMax = process.env.RATE_LIMIT_MAX;
    process.env.RATE_LIMIT_MAX = '2';
    // import after setting env
    const mod = await import('../src/middleware/rateLimiter');
    const rateLimiterHook = mod.rateLimiterHook as any;
    // reset internal map if present
    if (mod.__resetRateMap) mod.__resetRateMap();
    const req: any = { ip: '1.2.3.4' };
    const responses: any[] = [];
    const reply: any = {
      code: (c: number) => ({ send: (body: any) => responses.push({ c, body }) }),
    };
    // first
    await rateLimiterHook(req, reply);
    // second
    await rateLimiterHook(req, reply);
    // third should exceed
    await rateLimiterHook(req, reply);
    expect(responses.length).toBeGreaterThanOrEqual(1);
    const last = responses[responses.length - 1];
    expect(last.c).toBe(429);
    process.env.RATE_LIMIT_MAX = origMax;
  });
});
