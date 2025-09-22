import type { FastifyInstance } from 'fastify';
import config from '../config';
import { storeRefreshToken } from '../stores/refresh';

export default function registerLogin(server: FastifyInstance) {
  server.post('/login', async (request: any, reply: any) => {
    const body = (request.body as any) || {};
    const username = body.username;
    const password = body.password;
    const { user: authUser, pass: authPass } = config.auth;

    request.log.debug({ username }, 'processing login request');

    if (username === authUser && password === authPass) {
      const access = server.jwt.sign({ username }, { expiresIn: '15m' } as any);
      const refresh = server.jwt.sign({ username, type: 'refresh' }, { expiresIn: '7d' } as any);
      await storeRefreshToken(refresh, username);
      request.log.info({ username }, 'user authenticated successfully');
      return { token: access, refresh };
    }

    request.log.warn({ username }, 'user provided invalid credentials');
    reply.code(401).send({ error: 'Invalid credentials' });
  });
}
