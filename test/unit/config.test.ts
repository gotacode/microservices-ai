import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('config loader', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads default values when env vars are missing', async () => {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_PRETTY;
    delete process.env.HTTP_REQUEST_ID_HEADER;

    const { loadConfig } = await import('../../src/config');
    const cfg = loadConfig();

    expect(cfg.server.port).toBe(3000);
    expect(cfg.server.host).toBe('0.0.0.0');
    expect(cfg.logging.level).toBe('debug');
    expect(cfg.logging.pretty).toBe(true);
    expect(cfg.http.requestIdHeader).toBe('x-request-id');
    expect(cfg.http.cors.origin).toEqual(['*']);
    expect(cfg.http.compression.enabled).toBe(true);
  });

  it('respects overrides from environment variables', async () => {
    process.env.PORT = '4001';
    process.env.HOST = '127.0.0.1';
    process.env.LOG_LEVEL = 'error';
    process.env.LOG_PRETTY = 'false';
    process.env.AUTH_USER = 'tester';
    process.env.RATE_LIMIT_MAX = '10';
    process.env.HTTP_REQUEST_ID_HEADER = 'x-correlation-id';
    process.env.HTTP_CORS_ENABLED = 'true';
    process.env.HTTP_CORS_ORIGIN = 'https://example.com,https://foo.test';
    process.env.HTTP_CORS_METHODS = 'GET,POST';
    process.env.HTTP_CORS_ALLOW_CREDENTIALS = 'true';
    process.env.HTTP_COMPRESSION_ENABLED = 'false';
    process.env.HTTP_COMPRESSION_MIN_LENGTH = '512';
    process.env.HTTP_SECURITY_HEADERS_ENABLED = 'false';

    const { loadConfig } = await import('../../src/config');
    const cfg = loadConfig();

    expect(cfg.server.port).toBe(4001);
    expect(cfg.server.host).toBe('127.0.0.1');
    expect(cfg.logging.level).toBe('error');
    expect(cfg.logging.pretty).toBe(false);
    expect(cfg.auth.user).toBe('tester');
    expect(cfg.rateLimit.max).toBe(10);
    expect(cfg.http.requestIdHeader).toBe('x-correlation-id');
    expect(cfg.http.cors.origin).toEqual(['https://example.com', 'https://foo.test']);
    expect(cfg.http.cors.methods).toEqual(['GET', 'POST']);
    expect(cfg.http.cors.allowCredentials).toBe(true);
    expect(cfg.http.compression.enabled).toBe(false);
    expect(cfg.http.compression.minLength).toBe(512);
    expect(cfg.http.security.enabled).toBe(false);
  });
});
