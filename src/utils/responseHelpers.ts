import { FastifyReply } from 'fastify';

export const sendUnauthorizedError = (reply: FastifyReply, message: string) => {
  reply.code(401).send({ error: message });
};

export const sendBadRequestError = (reply: FastifyReply, message: string) => {
  reply.code(400).send({ error: message });
};
