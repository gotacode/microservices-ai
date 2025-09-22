import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

beforeAll(async () => {
  app = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(app);
});

describe('POST /login', () => {
  it('returns tokens for correct credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' },
    });

    expect(res.statusCode).toBe(200);
    const json = res.json();
    expect(json.token).toBeDefined();
    expect(json.refresh).toBeDefined();
  });

  it('returns 401 for incorrect credentials', async () => {
    const res = await app.inject({ method: 'POST', url: '/login', payload: { username: 'bad', password: 'creds' } });
    expect(res.statusCode).toBe(401);
  });
});
