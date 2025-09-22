import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

describe('auth', () => {
  beforeAll(async () => {
    app = await createTestServer();
  });
  afterAll(async () => {
    await closeTestServer(app);
  });

  it('POST /login returns token for valid creds', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' },
      headers: { 'content-type': 'application/json' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('token');
  });

  it('GET /protected requires token', async () => {
    const res = await app.inject({ method: 'GET', url: '/protected' });
    expect(res.statusCode).toBe(401);
  });
});
