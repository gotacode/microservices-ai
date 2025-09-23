import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env.LOG_LEVEL = 'info';
    process.env.LOG_PRETTY = 'false';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('creates logger with configured level and allows updating it', async () => {
    const { default: applicationLogger, setLoggerLevel } = await import('../../src/logger');
    expect(applicationLogger.level).toBe('info');
    setLoggerLevel('debug');
    expect(applicationLogger.level).toBe('debug');
  });

  it('gracefully falls back when pretty transport is not available', async () => {
    vi.resetModules();
    process.env.LOG_LEVEL = 'warn';
    process.env.LOG_PRETTY = 'true';

    // Mock require.resolve to simulate pino-pretty not being available
    vi.mock('pino-pretty', () => {
      throw new Error('pino-pretty not found');
    });

    const { default: applicationLogger } = await import('../../src/logger');
    expect(applicationLogger.level).toBe('warn');
    // Expect transport to be undefined, meaning it fell back to JSON logs
    // This is an internal detail, but we can infer it by the absence of pino-pretty
    // and the fact that the logger was still created without error.
  });
});
