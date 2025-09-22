import { storeRefreshToken } from '../stores/refresh';

export default function registerLogin(server: any) {
  server.post('/login', async (request: any, reply: any) => {
    const body = (request.body as any) || {};
    const username = body.username;
    const password = body.password;

    const AUTH_USER = process.env.AUTH_USER || 'admin';
    const AUTH_PASS = process.env.AUTH_PASS || 'password';

    if (username === AUTH_USER && password === AUTH_PASS) {
      const access = server.jwt.sign({ username }, { expiresIn: '15m' } as any);
      const refresh = server.jwt.sign({ username, type: 'refresh' }, { expiresIn: '7d' } as any);
      await storeRefreshToken(refresh, username);
      return { token: access, refresh };
    }

    reply.code(401).send({ error: 'Invalid credentials' });
  });
}
