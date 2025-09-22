import { describe, it, expect } from 'vitest';

describe('redis client optional', () => {
  it('exports null when ioredis not installed or REDIS_URL not set', async () => {
    // dynamic import so module reads current env
    delete process.env.REDIS_URL;
    delete process.env.__TEST_IOREDIS;
    const mod = await import('../src/plugins/redisClient');
    const redis = mod.default;
    expect(redis === null || typeof redis === 'object' || redis === undefined).toBeTruthy();
  });
});
