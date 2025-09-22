import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

// This will test the refresh endpoint edge cases and happy path
describe('POST /refresh and /protected', () => {
  it('returns 400 when refresh missing', async () => {
    const res = await request(server.server).post('/refresh').send({});
    expect(res.status).toBe(400);
  });

  it('returns 401 for invalid refresh token', async () => {
    const res = await request(server.server).post('/refresh').send({ refresh: 'not-a-token' });
    expect(res.status).toBe(401);
  });

  it('can use refresh token to obtain new access token and access protected route', async () => {
    // login first
    const login = await request(server.server)
      .post('/login')
      .send({ username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' });

    expect(login.status).toBe(200);
    const refresh = login.body.refresh;

    // use refresh
    const r = await request(server.server).post('/refresh').send({ refresh });
    expect(r.status).toBe(200);
    expect(r.body.token).toBeDefined();

    const access = r.body.token;
    // call protected
    const p = await request(server.server).get('/protected').set('authorization', `Bearer ${access}`);
    expect(p.status).toBe(200);
    expect(p.body.user).toBeDefined();
  });
});
