export default function registerAuth(server: any) {
  server.get('/protected', {
    preValidation: async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
      } catch {
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
      return reply.code(401).send({ error: 'invalid refresh token' });
    }

    try {
      const payload = server.jwt.verify(refresh) as any;
      if (payload?.type !== 'refresh') {
        return reply.code(401).send({ error: 'invalid token type' });
      }
      const username = payload.username;
      if (!username) {
        return reply.code(401).send({ error: 'invalid token payload' });
      }
      const access = server.jwt.sign({ username }, { expiresIn: '15m' } as any);
      return { token: access };
    } catch {
      return reply.code(401).send({ error: 'invalid refresh token' });
    }
  });
}
