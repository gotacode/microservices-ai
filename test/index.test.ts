import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

let app: any;

describe('basic server', () => {
  beforeAll(async () => {
    await server.ready();
    app = server.server; // Fastify raw server
  });

  afterAll(async () => {
    await server.close();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});