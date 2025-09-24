import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';
import { getRedisClient } from '../../../src/plugins/redisClient';

// Mock the redis client plugin to control its behavior in tests
vi.mock('../../../src/plugins/redisClient');

describe('GET /ready', () => {
  let app: TestServer;

  // Use afterEach to clean up the server and mocks after every test
  afterEach(async () => {
    if (app) {
      await closeTestServer(app);
    }
    vi.resetAllMocks();
  });

  it('should return 200 OK and redis status when redis is ready', async () => {
    // Arrange: Mock a healthy redis client that looks real enough for the rate limiter
    const mockRedisClient = {
      ping: vi.fn().mockResolvedValue('PONG'),
      quit: vi.fn(),
      defineCommand: vi.fn(), // Add the missing function for rate-limiter
    };
    vi.mocked(getRedisClient).mockReturnValue(mockRedisClient as any);
    app = await createTestServer();

    // Act
    const response = await app.inject({ method: 'GET', url: '/ready' });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready', redis: 'ready' });
    expect(mockRedisClient.ping).toHaveBeenCalledOnce();
  });

  it('should return 503 when redis ping fails', async () => {
    // Arrange: Mock a redis client that throws an error
    const mockRedisClient = {
      ping: vi.fn().mockRejectedValue(new Error('Connection timeout')),
      quit: vi.fn(),
      defineCommand: vi.fn(), // Add the missing function for rate-limiter
    };
    vi.mocked(getRedisClient).mockReturnValue(mockRedisClient as any);
    app = await createTestServer();

    // Act
    const response = await app.inject({ method: 'GET', url: '/ready' });

    // Assert
    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'not ready', redis: 'error' });
    expect(mockRedisClient.ping).toHaveBeenCalledOnce();
  });

  it('should return 200 OK when redis is disabled', async () => {
    // Arrange: Mock the client as being disabled (null)
    vi.mocked(getRedisClient).mockReturnValue(null);
    app = await createTestServer();

    // Act
    const response = await app.inject({ method: 'GET', url: '/ready' });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready', redis: 'disabled' });
  });
});
