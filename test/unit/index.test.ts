
import { vi, describe, it, expect, afterEach } from 'vitest';
import { start, server } from '../../src/index';
import { registerPlugins } from '../../src/plugins';
import { registerHooks } from '../../src/hooks';
import { registerErrorHandlers } from '../../src/errorHandlers';
import { registerAllRoutes } from '../../src/routes';

vi.mock('../../src/plugins');
vi.mock('../../src/hooks');
vi.mock('../../src/errorHandlers');
vi.mock('../../src/routes');
vi.mock('../../src/logger', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    })),
  },
}));

vi.mock('../../src/config', () => ({
  default: {
    logging: {
      level: 'info',
      pretty: false,
    },
    server: {
      port: 0, // use 0 to get a random available port
      host: '127.0.0.1',
    },
  },
  loadConfig: () => ({
    logging: {
      level: 'info',
      pretty: false,
    },
    server: {
      port: 0, // use 0 to get a random available port
      host: '127.0.0.1',
    },
  }),
}));

describe('index.ts', () => {
  afterEach(async () => {
    vi.clearAllMocks();
    await server.close();
  });

  it('should start the server and call all registration functions', async () => {
    await start();
    // The server should be listening
    expect(server.server.listening).toBe(true);

    // Now that the server is started, we can check if the registration functions were called
    // Note: This is not ideal, as we are not testing configureServer in isolation.
    // However, due to the nature of the index.ts file, this is the easiest way to test it.
    expect(registerPlugins).toHaveBeenCalledWith(server);
    expect(registerHooks).toHaveBeenCalledWith(server);
    expect(registerErrorHandlers).toHaveBeenCalledWith(server);
    expect(registerAllRoutes).toHaveBeenCalledWith(server);
  });

  // TODO: Add tests for graceful shutdown and error handling.
  // It is not possible to test this with vitest at the moment because it is not possible to spy on process.exit.
});
