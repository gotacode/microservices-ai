import type { FastifyInstance } from 'fastify';

export default function registerAuth(server: FastifyInstance) {
  server.get('/protected', {
    preValidation: async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
        request.log.debug('protected route authentication succeeded');
      } catch {
        request.log.warn('protected route authentication failed');
        reply.code(401).send({ error: 'Unauthorized' });
      }
    },
  }, async (request: any) => {
    return { user: (request as any).user || null };
  });

  server.post('/refresh', async (request: any, reply: any) => {
    const body = (request.body as any) || {};
    const refresh = body.refresh;
    if (!refresh) {
      return reply.code(400).send({ error: 'missing refresh token' });
    }

    const { validateRefreshToken } = await import('../stores/refresh');
    const valid = await validateRefreshToken(refresh);
    if (!valid) {
      request.log.warn('refresh token validation failed');
      return reply.code(401).send({ error: 'invalid refresh token' });
    }

    try {
      const payload = server.jwt.verify(refresh) as any;
      if (payload?.type !== 'refresh') {
        request.log.warn('refresh token payload type mismatch');
        return reply.code(401).send({ error: 'invalid token type' });
      }
      const username = payload.username;
      if (!username) {
        request.log.warn('refresh token payload missing username');
        return reply.code(401).send({ error: 'invalid token payload' });
      }
      const access = server.jwt.sign({ username }, { expiresIn: '15m' } as any);
      request.log.info({ username }, 'issued access token from refresh token');
      return { token: access };
    } catch {
      request.log.error('failed to verify refresh token');
      return reply.code(401).send({ error: 'invalid refresh token' });
    }
  });
}
