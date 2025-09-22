import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe('POST /login', () => {
  it('returns tokens for correct credentials', async () => {
    const res = await request(server.server)
      .post('/login')
      .send({ username: process.env.AUTH_USER || 'admin', password: process.env.AUTH_PASS || 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refresh).toBeDefined();
  });

  it('returns 401 for incorrect credentials', async () => {
    const res = await request(server.server)
      .post('/login')
      .send({ username: 'bad', password: 'creds' });
    expect(res.status).toBe(401);
  });
});
