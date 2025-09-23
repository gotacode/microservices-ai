import { FastifyInstance } from 'fastify';
import config from './config';

export const registerErrorHandlers = (app: FastifyInstance) => {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'unhandled error');
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    });
  });
};
