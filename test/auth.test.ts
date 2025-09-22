import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

describe('auth', () => {
  beforeAll(async () => {
    await server.ready();
  });
  afterAll(async () => {
    await server.close();
  });

  it('POST /login returns token for valid creds', async () => {
    const res = await request(server.server)
      .post('/login')
      .send({ username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('GET /protected requires token', async () => {
    const res = await request(server.server).get('/protected');
    expect(res.status).toBe(401);
  });
});
