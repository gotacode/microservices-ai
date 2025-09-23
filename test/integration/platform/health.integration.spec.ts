import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

describe('basic server', () => {
  beforeAll(async () => {
    app = await createTestServer();
  });

  afterAll(async () => {
    await closeTestServer(app);
  });

  it('GET /health returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
