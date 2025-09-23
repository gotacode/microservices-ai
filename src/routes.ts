import { FastifyInstance } from 'fastify';
import registerHealth from './routes/health';
import registerReady from './routes/ready';
import registerMetrics from './routes/metrics';
import registerOpenAPI from './routes/openapi';
import registerLogin from './routes/login';
import registerAuth from './routes/auth';

export const registerAllRoutes = (app: FastifyInstance) => {
  registerHealth(app);
  registerReady(app);
  registerMetrics(app);
  registerOpenAPI(app);
  registerLogin(app);
  registerAuth(app);
};
