
import { describe, it, expect } from 'vitest';
import { buildServer } from '../../src/index';

describe('openapi.ts', () => {
  it('should return a valid OpenAPI specification', async () => {
    const server = buildServer();
    const response = await server.inject({
      method: 'GET',
      url: '/openapi.json',
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.payload);
    expect(payload.openapi).toBe('3.0.0');
  });
});
