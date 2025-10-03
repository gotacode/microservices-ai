import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ZodError } from 'zod';

describe('config.ts', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    // Reset the process.env before each test
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe('loadConfig', () => {
    it('should load default config when no env vars are set', async () => {
      // we need to set a valid JWT_SECRET
      process.env.JWT_SECRET = 'a-very-long-and-secure-test-secret-for-vitest-env';
      delete process.env.NODE_ENV;
      const { loadConfig } = await import('../../src/config');
      const config = loadConfig();

      expect(config.appName).toBe('microservices-ai');
      expect(config.nodeEnv).toBe('development');
      expect(config.isProduction).toBe(false);
      expect(config.logging.level).toBe('debug');
      expect(config.logging.pretty).toBe(true);
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe('0.0.0.0');
      expect(config.auth.user).toBe('admin');
      expect(config.auth.pass).toBe('password');
      expect(config.auth.jwtSecret).toBe('a-very-long-and-secure-test-secret-for-vitest-env');
      expect(config.auth.jwtAudience).toBe('urn:microservices-ai:api');
      expect(config.auth.jwtIssuer).toBe('urn:microservices-ai:auth');
      expect(config.rateLimit.max).toBe(100);
      expect(config.rateLimit.windowSeconds).toBe(60);
      expect(config.redis.url).toBeUndefined();
      expect(config.http.requestIdHeader).toBe('x-request-id');
      expect(config.http.cors.enabled).toBe(true);
      expect(config.http.cors.origin).toEqual(['*']);
      expect(config.http.cors.methods).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
      expect(config.http.cors.allowCredentials).toBe(false);
      expect(config.http.compression.enabled).toBe(true);
      expect(config.http.compression.minLength).toBe(1024);
      expect(config.http.security.enabled).toBe(true);
    });

    it('should load production config when NODE_ENV is production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a-very-long-and-secure-test-secret-for-vitest-env';
      const { loadConfig } = await import('../../src/config');
      const config = loadConfig();

      expect(config.nodeEnv).toBe('production');
      expect(config.isProduction).toBe(true);
      expect(config.logging.level).toBe('info');
      expect(config.logging.pretty).toBe(false);
    });

    it('should load custom config from env vars', async () => {
      process.env.APP_NAME = 'my-app';
      process.env.LOG_LEVEL = 'warn';
      process.env.LOG_PRETTY = 'false';
      process.env.PORT = '4000';
      process.env.HOST = '127.0.0.1';
      process.env.AUTH_USER = 'user';
      process.env.AUTH_PASS = 'pass';
      process.env.JWT_SECRET = 'another-very-long-and-secure-test-secret';
      process.env.JWT_AUDIENCE = 'my-audience';
      process.env.JWT_ISSUER = 'my-issuer';
      process.env.RATE_LIMIT_MAX = '200';
      process.env.RATE_LIMIT_WINDOW_SEC = '120';
      process.env.REDIS_URL = 'redis://localhost:6380';
      process.env.HTTP_REQUEST_ID_HEADER = 'x-my-request-id';
      process.env.HTTP_CORS_ENABLED = 'false';
      process.env.HTTP_CORS_ORIGIN = 'http://localhost:3000';
      process.env.HTTP_CORS_METHODS = 'GET,POST';
      process.env.HTTP_CORS_ALLOW_CREDENTIALS = 'true';
      process.env.HTTP_COMPRESSION_ENABLED = 'false';
      process.env.HTTP_COMPRESSION_MIN_LENGTH = '2048';
      process.env.HTTP_SECURITY_HEADERS_ENABLED = 'false';

      const { loadConfig } = await import('../../src/config');
      const config = loadConfig();

      expect(config.appName).toBe('my-app');
      expect(config.logging.level).toBe('warn');
      expect(config.logging.pretty).toBe(false);
      expect(config.server.port).toBe(4000);
      expect(config.server.host).toBe('127.0.0.1');
      expect(config.auth.user).toBe('user');
      expect(config.auth.pass).toBe('pass');
      expect(config.auth.jwtSecret).toBe('another-very-long-and-secure-test-secret');
      expect(config.auth.jwtAudience).toBe('my-audience');
      expect(config.auth.jwtIssuer).toBe('my-issuer');
      expect(config.rateLimit.max).toBe(200);
      expect(config.rateLimit.windowSeconds).toBe(120);
      expect(config.redis.url).toBe('redis://localhost:6380');
      expect(config.http.requestIdHeader).toBe('x-my-request-id');
      expect(config.http.cors.enabled).toBe(false);
      expect(config.http.cors.origin).toEqual(['http://localhost:3000']);
      expect(config.http.cors.methods).toEqual(['GET', 'POST']);
      expect(config.http.cors.allowCredentials).toBe(true);
      expect(config.http.compression.enabled).toBe(false);
      expect(config.http.compression.minLength).toBe(2048);
      expect(config.http.security.enabled).toBe(false);
    });

    it('should throw error if JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;
      try {
        await import('../../src/config');
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });

    it('should throw error if JWT_SECRET is too short', async () => {
      process.env.JWT_SECRET = 'short';
      try {
        await import('../../src/config');
      } catch (e) {
        expect(e).toBeInstanceOf(ZodError);
      }
    });
  });
});