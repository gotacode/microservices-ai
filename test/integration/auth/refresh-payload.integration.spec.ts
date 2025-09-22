import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';
import { storeRefreshToken } from '../../../src/stores/refresh';

let app: TestServer;

beforeAll(async () => {
  app = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(app);
});

describe('POST /refresh payload edge cases', () => {
  it('returns 401 when refresh token payload missing username', async () => {
    // create a refresh token with no username
    const refresh = app.jwt.sign({ type: 'refresh' } as any, { expiresIn: '7d' } as any);
    // store it so validateRefreshToken returns non-null
    await storeRefreshToken(refresh, undefined);

    const res = await app.inject({ method: 'POST', url: '/refresh', payload: { refresh } });
    expect(res.statusCode).toBe(401);
    expect(res.json().error).toBeDefined();
  });
});
