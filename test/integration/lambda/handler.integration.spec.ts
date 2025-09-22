import { describe, it, expect } from 'vitest';
import { handler } from '../../../src/handlers/lambda';

describe('lambda handler', () => {
  it('returns health for /health path', async () => {
    const res = await handler({ path: '/health' } as any, {} as any);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
  });

  it('returns 501 for unknown path', async () => {
    const res = await handler({ path: '/unknown' } as any, {} as any);
    expect(res.statusCode).toBe(501);
  });
});
