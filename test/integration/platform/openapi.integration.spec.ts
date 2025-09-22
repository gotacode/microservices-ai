import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';

let app: TestServer;

beforeAll(async () => {
  app = await createTestServer();
});

afterAll(async () => {
  await closeTestServer(app);
});

describe('GET /openapi.json', () => {
  it('returns basic openapi object', async () => {
    const res = await app.inject({ method: 'GET', url: '/openapi.json' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.openapi).toBe('3.0.0');
    expect(body.paths['/protected']).toBeTruthy();
  });
});
