import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getRedisClient } from '../plugins/redisClient';

export default function registerReady(server: FastifyInstance) {
  server.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    const redis = getRedisClient();

    // If redis is disabled at the config level, the service is considered ready without it.
    if (!redis) {
      return { status: 'ready', redis: 'disabled' };
    }

    try {
      // PING returns "PONG" on success
      const pong = await redis.ping();
      if (pong === 'PONG') {
        return { status: 'ready', redis: 'ready' };
      }
      // In case of an unexpected response from PING
      request.log.warn({ response: pong }, 'Unexpected response from Redis PING');
      reply.code(503);
      return { status: 'not ready', redis: 'unhealthy' };
    } catch (err) {
      request.log.error({ err }, 'Readiness check failed: Redis PING command failed');
      reply.code(503);
      return { status: 'not ready', redis: 'error' };
    }
  });
}