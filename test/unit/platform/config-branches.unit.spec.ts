import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeEach(async () => {
  // Reset modules to ensure fresh import of config and server after env changes
  vi.resetModules();
  // Dynamically import buildServer after env is set
  const { buildServer } = await import('../../../src/index');
  app = buildServer();
  await app.ready();
});

afterEach(async () => {
  await app.close();
  // Clean up environment variables
  delete process.env.HTTP_CORS_ENABLED;
  delete process.env.HTTP_SECURITY_HEADERS_ENABLED;
  delete process.env.HTTP_COMPRESSION_ENABLED;
});

describe('Fastify Configuration Branches', () => {
  it('should not enable CORS when HTTP_CORS_ENABLED is false', async () => {
    process.env.HTTP_CORS_ENABLED = 'false';
    // Re-import and build server after env change
    vi.resetModules();
    const { buildServer } = await import('../../../src/index');
    app = buildServer();
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should not enable security headers when HTTP_SECURITY_HEADERS_ENABLED is false', async () => {
    process.env.HTTP_SECURITY_HEADERS_ENABLED = 'false';
    // Re-import and build server after env change
    vi.resetModules();
    const { buildServer } = await import('../../../src/index');
    app = buildServer();
    await app.ready();

    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['x-xss-protection']).toBeUndefined();
  });

  it('should not enable compression when HTTP_COMPRESSION_ENABLED is false', async () => {
    process.env.HTTP_COMPRESSION_ENABLED = 'false';
    // Re-import and build server after env change
    vi.resetModules();
    const { buildServer } = await import('../../../src/index');
    app = buildServer();
    await app.ready();

    // Inject a request that would normally be compressed (e.g., a large JSON response)
    const res = await app.inject({
      method: 'GET',
      url: '/openapi.json', // openapi.json is usually large enough
      headers: { 'Accept-Encoding': 'gzip, deflate, br' },
    });
    expect(res.headers['content-encoding']).toBeUndefined();
  });
});
