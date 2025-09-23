import type { FastifyInstance } from 'fastify';
import config from '../config';
import { storeRefreshToken } from '../stores/refresh';

export default function registerLogin(server: FastifyInstance) {
  const schema = {
    body: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  };

  server.post('/login', { schema }, async (request: any, reply: any) => {
    const { username, password } = request.body;
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