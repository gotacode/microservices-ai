
import { FastifyReply } from 'fastify';
import { sendUnauthorizedError, sendBadRequestError } from '../../../src/utils/responseHelpers';
import { describe, it, expect, vi } from 'vitest';

describe('Response Helpers', () => {
  it('sendUnauthorizedError should send a 401 error', () => {
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    sendUnauthorizedError(reply, 'Unauthorized');

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('sendBadRequestError should send a 400 error', () => {
    const reply = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply;

    sendBadRequestError(reply, 'Bad Request');

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Bad Request' });
  });
});
