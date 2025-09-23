import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHandler } from '../../../src/handlers/lambda';
import { createTestServer, closeTestServer, type TestServer } from '../../support/server';
import type { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';

describe('lambda handler', () => {
  let app: TestServer;
  let handler: (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;

  beforeAll(async () => {
    app = await createTestServer();
    handler = createHandler(app);
  });

  afterAll(async () => {
    await closeTestServer(app);
  });

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

  it('handles multi-value query strings', async () => {
    const res = await handler({
      path: '/test-query',
      httpMethod: 'GET',
      queryStringParameters: { foo: 'bar' },
      multiValueQueryStringParameters: { foo: ['bar', 'baz'] },
    } as any, {} as any);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.foo).toEqual(['bar', 'baz']);
  });

  it('handles base64 encoded non-json payloads', async () => {
    const base64 = Buffer.from('hello world').toString('base64');
    const res = await handler({
      path: '/test-echo',
      httpMethod: 'POST',
      body: base64,
      isBase64Encoded: true,
      headers: { 'content-type': 'text/plain' },
    } as any, {} as any);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual('hello world');
  });

  it('handles invalid JSON payloads', async () => {
    const res = await handler({
      path: '/login',
      httpMethod: 'POST',
      body: '{"bad":"json"',
      headers: { 'content-type': 'application/json' },
    } as any, {} as any);
    expect(res.statusCode).toBe(400);
  });

  it('handles plain text payloads', async () => {
    const res = await handler({
      path: '/test-echo',
      httpMethod: 'POST',
      body: 'just text',
      headers: { 'content-type': 'text/plain' },
    } as any, {} as any);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual('just text');
  });
});