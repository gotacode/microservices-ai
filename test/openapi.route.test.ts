import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { server } from '../src/index';

beforeAll(async () => await server.ready());
afterAll(async () => await server.close());

describe('GET /openapi.json', () => {
  it('returns basic openapi object', async () => {
    const res = await request(server.server).get('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.paths['/protected']).toBeTruthy();
  });
});
