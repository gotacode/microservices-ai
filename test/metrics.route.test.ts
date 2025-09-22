import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

beforeAll(async () => {
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe('GET /metrics', () => {
  it('returns prometheus metrics text', async () => {
    const res = await request(server.server).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toBeTruthy();
  });
});
