import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';
import { storeRefreshToken } from '../src/stores/refresh';

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe('POST /refresh payload edge cases', () => {
  it('returns 401 when refresh token payload missing username', async () => {
    // create a refresh token with no username
    const refresh = server.jwt.sign({ type: 'refresh' } as any, { expiresIn: '7d' } as any);
    // store it so validateRefreshToken returns non-null
    await storeRefreshToken(refresh, undefined);

    const res = await request(server.server).post('/refresh').send({ refresh });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
