import type { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';

type TestServer = FastifyInstance;

export const createTestServer = async (): Promise<TestServer> => {
  const app = buildServer();
  await app.ready();
  return app;
};

export const closeTestServer = async (app?: TestServer) => {
  if (!app) {
    return;
  }
  await app.close();
};

export const useTestServer = () => {
  let app: TestServer;

  return {
    get instance() {
      return app;
    },
    async beforeAll() {
      app = await createTestServer();
      return app;
    },
    async afterAll() {
      await closeTestServer(app);
    },
  };
};

export type { TestServer };
