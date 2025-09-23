import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import config from './config';

export const registerHooks = (app: FastifyInstance) => {
  const { http: httpConfig } = config;

  app.addHook('onError', (request, reply, error, done) => {
    request.log.error({ err: error }, 'request failed');
    reply.header(httpConfig.requestIdHeader, request.id ?? '');
    done();
  });

  app.addHook('onSend', (request, reply, payload, done) => {
    reply.header(httpConfig.requestIdHeader, request.id ?? '');
    done(null, payload);
  });
};
