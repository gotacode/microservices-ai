import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('runtime.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    // Reset the process.env before each test
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('runtime object', () => {
    it('should correctly identify lambda environment', async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = 'my-lambda';
      const { runtime } = await import('../../src/runtime');
      expect(runtime.isLambda).toBe(true);
      expect(runtime.isContainer).toBe(false);
      expect(runtime.isNode).toBe(false);
      expect(runtime.target).toBe('lambda');
    });

    it('should correctly identify container environment', async () => {
      process.env.CONTAINER = 'true';
      const { runtime } = await import('../../src/runtime');
      expect(runtime.isLambda).toBe(false);
      expect(runtime.isContainer).toBe(true);
      expect(runtime.isNode).toBe(false);
      expect(runtime.target).toBe('container');
    });

    it('should correctly identify node environment', async () => {
      const { runtime } = await import('../../src/runtime');
      expect(runtime.isLambda).toBe(false);
      expect(runtime.isContainer).toBe(false);
      expect(runtime.isNode).toBe(true);
      expect(runtime.target).toBe('node');
    });
  });

  describe('shouldAutoStartServer', () => {
    it('should return false if NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      const { shouldAutoStartServer } = await import('../../src/runtime');
      expect(shouldAutoStartServer()).toBe(false);
    });

    it('should return false if runtime is lambda', async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = 'my-lambda';
      const { shouldAutoStartServer } = await import('../../src/runtime');
      expect(shouldAutoStartServer()).toBe(false);
    });

    it('should return false if DISABLE_SERVER_AUTOSTART is true', async () => {
      process.env.DISABLE_SERVER_AUTOSTART = 'true';
      const { shouldAutoStartServer } = await import('../../src/runtime');
      expect(shouldAutoStartServer()).toBe(false);
    });

    it('should return true otherwise', async () => {
      delete process.env.NODE_ENV;
      const { shouldAutoStartServer } = await import('../../src/runtime');
      expect(shouldAutoStartServer()).toBe(true);
    });
  });
});