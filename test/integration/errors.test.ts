
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type FastifyInstance } from 'fastify';
import { buildServer } from '../support/server';

describe('Error Handlers', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = buildServer();
    // Add a route that will be used to test the 500 error handler
    server.get('/internal-error', async () => {
      throw new Error('This is a deliberate internal server error');
    });

    // Add a route to test client-side errors (status < 500)
    server.get('/teapot-error', async () => {
      const err = new Error('I am a teapot');
      // @ts-ignore - attaching custom property for test
      err.statusCode = 418;
      throw err;
    });
  });

  afterAll(async () => {
    await server.close();
  });

  it('should return a 404 error for a non-existent route', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/this-route-does-not-exist',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Route GET:/this-route-does-not-exist not found',
    });
  });

  it('should return a 500 error when a route handler throws an error', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/internal-error',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: 'Internal Server Error' });
  });

  it('should return the error message for status codes below 500', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/teapot-error',
    });

    expect(response.statusCode).toBe(418);
    expect(response.json()).toEqual({ error: 'I am a teapot' });
  });
});
