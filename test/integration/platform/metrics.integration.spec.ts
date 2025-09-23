import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Registry } from 'prom-client';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

beforeAll(async () => {
  app = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(app);
});

describe('GET /metrics', () => {
  it('returns prometheus metrics text', async () => {
    const res = await app.inject({ method: 'GET', url: '/metrics' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.body).toBeTruthy();
  });

  it('returns 500 if metrics collection fails', async () => {
    const metricsSpy = vi.spyOn(Registry.prototype, 'metrics').mockRejectedValue(new Error('Metrics collection failed'));

    const res = await app.inject({ method: 'GET', url: '/metrics' });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({ error: 'could not collect metrics' });

    metricsSpy.mockRestore();
  });
});