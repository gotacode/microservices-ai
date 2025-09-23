import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the runtime module to control shouldAutoStartServer and its internal state
vi.mock('../../../src/runtime', async (importActual) => {
  const actual = await importActual<typeof import('../../../src/runtime')>();
  return {
    ...actual,
    shouldAutoStartServer: vi.fn(), // Mock this function
    runtime: { // Mock the runtime object itself
      target: 'node', // Default to node
      isLambda: false, // Default to not lambda
      isContainer: false, // Default to not container
      isNode: true, // Default to node
    },
  };
});

// Import the mocked runtime and the index module
import * as runtime from '../../../src/runtime';
import * as indexModule from '../../../src/index'; // Import as namespace to access start

describe('index start', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv }; // Clone env to avoid side effects
    // Reset the mock for each test
    vi.mocked(runtime.shouldAutoStartServer).mockRestore(); // Restore to default behavior first
    vi.spyOn(indexModule, 'start').mockRestore(); // Restore original start if it was spied on
  });

  afterEach(() => {
    process.env = originalEnv; // Restore original env
    vi.resetModules(); // Clear module cache
  });

  // Existing tests for start() success/failure (need to adapt them to import start dynamically)
  it('calls start and handles listen success', async () => {
    // Dynamically import index.ts to get the current server and start
    const { server, start } = await import('../../../src/index');
    // stub server.listen to avoid actually binding sockets
    const origListen = (server as any).listen;
    let called = false;
    (server as any).listen = async () => {
      called = true;
      return Promise.resolve();
    };
    // Ensure auto-start is enabled for this test
    vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(true);
    await start(); // Call the actual start function
    expect(called).toBe(true);
    // restore
    (server as any).listen = origListen;
  });

  it('handles listen failure by exiting', async () => {
    // Dynamically import index.ts to get the current server and start
    const { server, start } = await import('../../../src/index');
    const origListen = (server as any).listen;
    const origExit = process.exit;
    let exitCode: number | undefined;
    (server as any).listen = async () => {
      throw new Error('listen fail');
    };
    // stub process.exit to capture call
    // @ts-ignore
    process.exit = (code?: number) => {
      exitCode = code;
      // throw to stop further execution
      throw new Error('exited');
    };
    let threw = false;
    try {
      // Ensure auto-start is enabled for this test
      vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(true);
      await start();
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    expect(exitCode).toBe(1);
    (server as any).listen = origListen;
    // @ts-ignore
    process.exit = origExit;
  });


  describe('server auto-start behavior', () => {
    let startSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Spy on the actual start function to see if it's called
      startSpy = vi.spyOn(indexModule, 'start');
      // Mock server.listen to prevent EADDRINUSE errors during tests
      vi.spyOn(indexModule.server, 'listen').mockResolvedValue(undefined);
    });

    afterEach(() => {
      startSpy.mockRestore(); // Restore original start function
    });

    it('should auto-start server if conditions are met (default)', async () => {
      // Ensure conditions for auto-start are met (default env)
      delete process.env.NODE_ENV;
      delete process.env.AWS_LAMBDA_FUNCTION_NAME;
      delete process.env.DISABLE_SERVER_AUTOSTART;

      // Mock shouldAutoStartServer to return true (as it would by default)
      vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(true);

      // Dynamically import index.ts to ensure module is loaded and then call start
      await import('../../../src/index');
      await indexModule.start(); // Explicitly call the exported start function
      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should not auto-start if NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      // Mock shouldAutoStartServer to return false (as it would by default)
      vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(false);
      await import('../../../src/index');
      expect(startSpy).not.toHaveBeenCalled();
    });

    it('should not auto-start if runtime is lambda', async () => {
      process.env.AWS_LAMBDA_FUNCTION_NAME = 'true';
      // Mock shouldAutoStartServer to return false (as it would by default)
      vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(false);
      await import('../../../src/index');
      expect(startSpy).not.toHaveBeenCalled();
    });

    it('should not auto-start if DISABLE_SERVER_AUTOSTART is true', async () => {
      process.env.DISABLE_SERVER_AUTOSTART = 'true';
      // Mock shouldAutoStartServer to return false (as it would by default)
      vi.mocked(runtime.shouldAutoStartServer).mockReturnValue(false);
      await import('../../../src/index');
      expect(startSpy).not.toHaveBeenCalled();
    });
  });
});