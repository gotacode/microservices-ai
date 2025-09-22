import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

beforeAll(async () => {
  app = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(app);
});

// This will test the refresh endpoint edge cases and happy path
describe('POST /refresh and /protected', () => {
  it('returns 400 when refresh missing', async () => {
    const res = await app.inject({ method: 'POST', url: '/refresh', payload: {} });
    expect(res.statusCode).toBe(400);
  });

  it('returns 401 for invalid refresh token', async () => {
    const res = await app.inject({ method: 'POST', url: '/refresh', payload: { refresh: 'not-a-token' } });
    expect(res.statusCode).toBe(401);
  });

  it('can use refresh token to obtain new access token and access protected route', async () => {
    // login first
    const login = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' },
    });

    expect(login.statusCode).toBe(200);
    const refresh = login.json().refresh;

    // use refresh
    const r = await app.inject({ method: 'POST', url: '/refresh', payload: { refresh } });
    expect(r.statusCode).toBe(200);
    const tokenResponse = r.json();
    expect(tokenResponse.token).toBeDefined();

    const access = tokenResponse.token;
    // call protected
    const p = await app.inject({ method: 'GET', url: '/protected', headers: { authorization: `Bearer ${access}` } });
    expect(p.statusCode).toBe(200);
    expect(p.json().user).toBeDefined();
  });
});
