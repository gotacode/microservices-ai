import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify, { type FastifyInstance } from 'fastify';

// Mock logger
const mockLogger = {
  error: vi.fn(),
  child: vi.fn(() => mockLogger),
};

// Mock config
const mockConfig = {
  http: { requestIdHeader: 'x-request-id' },
};

// Mock Fastify instance
const mockFastifyInstance = {
  addHook: vi.fn(),
  log: mockLogger,
};

// Import the function to be tested
import { registerHooks } from '../../src/hooks';

describe('Hooks', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    app = mockFastifyInstance as any; // Use our mock Fastify instance
  });

  it('should register onError and onSend hooks', () => {
    registerHooks(app);

    expect(app.addHook).toHaveBeenCalledTimes(2);

    // Test onError hook
    const onErrorHook = app.addHook.mock.calls[0][1]; // Get the second argument (the hook function) of the first addHook call
    const mockRequest = { log: mockLogger, id: 'test-request-id' } as any;
    const mockReply = { header: vi.fn() } as any;
    const mockError = new Error('Test Error');
    const mockDone = vi.fn();

    onErrorHook(mockRequest, mockReply, mockError, mockDone);

    expect(mockLogger.error).toHaveBeenCalledWith({ err: mockError }, 'request failed');
    expect(mockReply.header).toHaveBeenCalledWith(mockConfig.http.requestIdHeader, 'test-request-id');
    expect(mockDone).toHaveBeenCalledWith();

    // Test onSend hook
    const onSendHook = app.addHook.mock.calls[1][1]; // Get the second argument (the hook function) of the second addHook call
    const mockPayload = { data: 'test' };
    mockRequest.id = 'another-request-id'; // Change request id for onSend test
    mockReply.header.mockClear(); // Clear previous header calls
    mockDone.mockClear(); // Clear previous done calls

    onSendHook(mockRequest, mockReply, mockPayload, mockDone);

    expect(mockReply.header).toHaveBeenCalledWith(mockConfig.http.requestIdHeader, 'another-request-id');
    expect(mockDone).toHaveBeenCalledWith(null, mockPayload);
  });
});
