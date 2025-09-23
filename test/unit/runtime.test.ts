import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('runtime helpers', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('detects lambda environment', async () => {
    process.env.NODE_ENV = 'production';
    process.env.AWS_LAMBDA_FUNCTION_NAME = 'demo';
    const { runtime, shouldAutoStartServer } = await import('../../src/runtime');
    expect(runtime.isLambda).toBe(true);
    expect(runtime.target).toBe('lambda');
    expect(shouldAutoStartServer()).toBe(false);
  });

  it('detects container environment and respects manual override', async () => {
    process.env.NODE_ENV = 'production';
    process.env.KUBERNETES_SERVICE_HOST = 'kube';
    process.env.RUNTIME_TARGET = 'container';
    const { runtime, shouldAutoStartServer } = await import('../../src/runtime');
    expect(runtime.isContainer).toBe(true);
    expect(runtime.target).toBe('container');
    expect(shouldAutoStartServer()).toBe(true);
  });

  it('honours disable auto start flag', async () => {
    process.env.NODE_ENV = 'production';
    process.env.RUNTIME_TARGET = 'node';
    process.env.DISABLE_SERVER_AUTOSTART = 'true';
    const { shouldAutoStartServer } = await import('../../src/runtime');
    expect(shouldAutoStartServer()).toBe(false);
  });
});
