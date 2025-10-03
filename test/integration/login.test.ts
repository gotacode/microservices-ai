
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { type FastifyInstance } from 'fastify';

const storeRefreshTokenMock = vi.fn();

const buildServerWithMock = async () => {
  vi.resetModules();

  vi.doMock('../../src/stores/refresh', () => ({
    storeRefreshToken: storeRefreshTokenMock,
  }));

  const { buildServer } = await import('../support/server');
  return buildServer();
};

describe('POST /login', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await buildServerWithMock();
  });

  afterEach(async () => {
    await server.close();
    storeRefreshTokenMock.mockClear();
  });

  it('should return 400 when body is invalid', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: { username: 'admin' }, // Missing password
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe("body must have required property 'password'");
  });

  it('should return 401 when credentials are invalid', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: { username: 'admin', password: 'wrong' },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: 'Invalid credentials' });
  });

  it('should return 200 with tokens when credentials are valid', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: { username: 'admin', password: 'password' },
    });

    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('refresh');
    expect(typeof body.token).toBe('string');
    expect(typeof body.refresh).toBe('string');

    // Verify that the side-effect (storing the token) was called
    expect(storeRefreshTokenMock).toHaveBeenCalledOnce();
    expect(storeRefreshTokenMock).toHaveBeenCalledWith(body.refresh, 'admin');
  });
});
