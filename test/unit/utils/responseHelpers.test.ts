import { FastifyReply } from 'fastify';
import { sendUnauthorizedError, sendBadRequestError } from '../../../src/utils/responseHelpers';
import { describe, it, expect, vi } from 'vitest';

describe('responseHelpers', () => {
  it('should send an unauthorized error with the correct status code and message', () => {
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const message = 'Unauthorized access';
    sendUnauthorizedError(reply, message);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: message });
  });

  it('should send a bad request error with the correct status code and message', () => {
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    const message = 'Invalid input';
    sendBadRequestError(reply, message);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: message });
  });
});
