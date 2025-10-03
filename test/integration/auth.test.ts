
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { type FastifyInstance } from 'fastify';

const validateRefreshTokenMock = vi.fn();

const buildServerWithMocks = async () => {
  vi.resetModules();

  vi.doMock('../../src/stores/refresh', async (importOriginal) => {
    const original = await importOriginal();
    return {
      ...original,
      validateRefreshToken: validateRefreshTokenMock,
    };
  });

  const { buildServer } = await import('../support/server');
  return buildServer();
};

describe('Auth Routes', () => {
  let server: FastifyInstance;

  beforeEach(async () => {
    server = await buildServerWithMocks();
  });

  afterEach(async () => {
    await server.close();
    validateRefreshTokenMock.mockClear();
  });

  describe('GET /protected', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await server.inject({ method: 'GET', url: '/protected' });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: 'Unauthorized' });
    });

    it('should return 200 if a valid token is provided', async () => {
      // First, get a valid token by logging in
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/login',
        payload: { username: 'admin', password: 'password' },
      });
      const { token } = loginResponse.json();

      // Now, use the token to access the protected route
      const response = await server.inject({
        method: 'GET',
        url: '/protected',
        headers: { authorization: `Bearer ${token}` },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().user).toHaveProperty('username', 'admin');
    });
  });

  describe('POST /refresh', () => {
    it('should return 400 if no refresh token is provided', async () => {
      const response = await server.inject({ method: 'POST', url: '/refresh', payload: {} });
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: 'missing refresh token' });
    });

    it('should return 401 if refresh token is not valid in the store', async () => {
      validateRefreshTokenMock.mockResolvedValue(null);

      const response = await server.inject({
        method: 'POST',
        url: '/refresh',
        payload: { refresh: 'any-token' },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: 'invalid refresh token' });
    });

    it('should return 401 if token is not a refresh token', async () => {
      validateRefreshTokenMock.mockResolvedValue({ username: 'admin' });
      // Get an access token (which is the wrong type)
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/login',
        payload: { username: 'admin', password: 'password' },
      });
      const { token } = loginResponse.json();

      const response = await server.inject({
        method: 'POST',
        url: '/refresh',
        payload: { refresh: token }, // Sending an access token
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: 'invalid token type' });
    });

    it('should return a new access token if refresh token is valid', async () => {
      validateRefreshTokenMock.mockResolvedValue({ username: 'admin' });
      // Get a real refresh token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/login',
        payload: { username: 'admin', password: 'password' },
      });
      const { refresh } = loginResponse.json();

      const response = await server.inject({
        method: 'POST',
        url: '/refresh',
        payload: { refresh },
      });

      const body = response.json();
      expect(response.statusCode).toBe(200);
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
    });
  });
});
