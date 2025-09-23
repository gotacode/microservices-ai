import { describe, it, expect } from 'vitest';
import { handler } from '../../../src/handlers/lambda';

describe('lambda handler', () => {
  it('returns health for /health path', async () => {
    const res = await handler({ path: '/health', httpMethod: 'GET' } as any, {} as any);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
  });

  it('returns 404 for unknown path', async () => {
    const res = await handler({ path: '/unknown', httpMethod: 'GET' } as any, {} as any);
    expect(res.statusCode).toBe(404);
  });

  it('forwards JSON payloads correctly', async () => {
    const payload = { username: 'admin', password: 'password' };
    const res = await handler({
      path: '/login',
      httpMethod: 'POST',
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    } as any, {} as any);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.token).toBeDefined();
  });

  it('decodes base64 payloads', async () => {
    const base64 = Buffer.from(JSON.stringify({ username: 'admin', password: 'password' })).toString('base64');
    const res = await handler({
      path: '/login',
      httpMethod: 'POST',
      body: base64,
      isBase64Encoded: true,
      headers: { 'content-type': 'application/json' },
    } as any, {} as any);
    expect(res.statusCode).toBe(200);
  });
});
