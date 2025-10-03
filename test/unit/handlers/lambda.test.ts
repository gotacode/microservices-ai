
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before any other imports
const serverInjectMock = vi.fn();
const serverReadyMock = vi.fn(() => Promise.resolve());
const serverMock = {
  inject: serverInjectMock,
  ready: serverReadyMock,
};

const mapHeadersMock = vi.fn();
const mapQueryStringMock = vi.fn();
const parsePayloadMock = vi.fn();

vi.mock('../../../src/index', () => ({ server: serverMock }));
vi.mock('../../../src/logger', () => ({ default: { debug: vi.fn() } }));
vi.mock('../../../src/handlers/lambda.mapper', () => ({
  mapHeaders: mapHeadersMock,
  mapQueryString: mapQueryStringMock,
  parsePayload: parsePayloadMock,
}));

describe('Lambda Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should map event and context, inject into server, and return mapped response', async () => {
    // 1. Setup
    const { handler } = await import('../../../src/handlers/lambda');

    const fakeEvent = { path: '/test', httpMethod: 'POST' } as any;
    const fakeContext = {} as any;

    // Mock the mapper functions to return predictable values
    mapHeadersMock.mockReturnValue({ 'x-mapped-header': 'true' });
    mapQueryStringMock.mockReturnValue({ mapped: 'query' });
    parsePayloadMock.mockReturnValue({ mapped: 'payload' });

    // Mock the server response
    const fakeServerResponse = {
      statusCode: 201,
      body: '{"status":"created"}',
      headers: { 'x-response-header': 'true' },
    };
    serverInjectMock.mockResolvedValue(fakeServerResponse);

    // 2. Execute
    const result = await handler(fakeEvent, fakeContext);

    // 3. Assert
    // Assert server was ready
    expect(serverReadyMock).toHaveBeenCalledOnce();

    // Assert mappers were called
    expect(mapHeadersMock).toHaveBeenCalledWith(fakeEvent.headers);
    expect(mapQueryStringMock).toHaveBeenCalledWith(fakeEvent.queryStringParameters, fakeEvent.multiValueQueryStringParameters);
    expect(parsePayloadMock).toHaveBeenCalledWith(fakeEvent);

    // Assert server.inject was called correctly
    expect(serverInjectMock).toHaveBeenCalledWith({
      method: 'POST',
      url: '/test',
      headers: { 'x-mapped-header': 'true' },
      query: { mapped: 'query' },
      payload: { mapped: 'payload' },
    });

    // Assert the final response is mapped correctly
    expect(result).toEqual({
      statusCode: 201,
      body: '{"status":"created"}',
      headers: { 'x-response-header': 'true' },
    });
  });
});
