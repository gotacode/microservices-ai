import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Mock logger
const mockLogger = {
  error: vi.fn(),
  child: vi.fn(() => mockLogger),
};

// Mock Fastify instance
const mockFastifyInstance = {
  setErrorHandler: vi.fn(),
  log: mockLogger,
};

// Import the function to be tested
import { registerErrorHandlers } from '../../src/errorHandlers';

describe('Error Handlers', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    app = mockFastifyInstance as any; // Use our mock Fastify instance
  });

  it('should register a custom error handler', () => {
    registerErrorHandlers(app);

    expect(app.setErrorHandler).toHaveBeenCalledTimes(1);
    const errorHandler = app.setErrorHandler.mock.calls[0][0];

    // Simulate an error with statusCode
    const errorWithStatusCode = { statusCode: 404, message: 'Not Found' };
    const mockRequest = { log: mockLogger } as any;
    const mockReply = { status: vi.fn(() => mockReply), send: vi.fn() } as any;

    errorHandler(errorWithStatusCode, mockRequest, mockReply);

    expect(mockLogger.error).toHaveBeenCalledWith({ err: errorWithStatusCode }, 'unhandled error');
    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Not Found' });

    // Simulate an error without statusCode (should default to 500)
    const errorWithoutStatusCode = new Error('Internal Error');
    mockLogger.error.mockClear();
    mockReply.status.mockClear();
    mockReply.send.mockClear();

    errorHandler(errorWithoutStatusCode, mockRequest, mockReply);

    expect(mockLogger.error).toHaveBeenCalledWith({ err: errorWithoutStatusCode }, 'unhandled error');
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });

    // Simulate a 5xx error
    const error5xx = { statusCode: 503, message: 'Service Unavailable' };
    mockLogger.error.mockClear();
    mockReply.status.mockClear();
    mockReply.send.mockClear();

    errorHandler(error5xx, mockRequest, mockReply);

    expect(mockLogger.error).toHaveBeenCalledWith({ err: error5xx }, 'unhandled error');
    expect(mockReply.status).toHaveBeenCalledWith(503);
    expect(mockReply.send).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
