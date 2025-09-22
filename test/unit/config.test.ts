import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('config loader', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads default values when env vars are missing', async () => {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_PRETTY;

    const { loadConfig } = await import('../../src/config');
    const cfg = loadConfig();

    expect(cfg.server.port).toBe(3000);
    expect(cfg.server.host).toBe('0.0.0.0');
    expect(cfg.logging.level).toBe('debug');
    expect(cfg.logging.pretty).toBe(true);
  });

  it('respects overrides from environment variables', async () => {
    process.env.PORT = '4001';
    process.env.HOST = '127.0.0.1';
    process.env.LOG_LEVEL = 'error';
    process.env.LOG_PRETTY = 'false';
    process.env.AUTH_USER = 'tester';
    process.env.RATE_LIMIT_MAX = '10';

    const { loadConfig } = await import('../../src/config');
    const cfg = loadConfig();

    expect(cfg.server.port).toBe(4001);
    expect(cfg.server.host).toBe('127.0.0.1');
    expect(cfg.logging.level).toBe('error');
    expect(cfg.logging.pretty).toBe(false);
    expect(cfg.auth.user).toBe('tester');
    expect(cfg.rateLimit.max).toBe(10);
  });
});
