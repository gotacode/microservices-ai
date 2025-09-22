let client: any = null;

const initClient = () => {
  client = null;
  const REDIS_URL = process.env.REDIS_URL;
  try {
    // Allow tests to inject a fake ioredis via env flag
    if (process.env.__TEST_IOREDIS === '1') {
      client = {
        url: REDIS_URL || 'mock',
        setex: async () => {},
        get: async () => null,
        incr: async () => 1,
        expire: async () => {},
      };
    } else {
      // require lazily so tests without ioredis installed don't fail
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Redis = require('ioredis');
      if (REDIS_URL) {
        client = new Redis(REDIS_URL);
      }
    }
  } catch (err) {
    // optional dependency missing; fall back to null client
    client = null;
  }
};

// initialize on module load
initClient();

// test helper to reinitialize based on current env
export const __initRedisClient = () => initClient();
export const __getRedisClient = () => client;

// test helper to set a fake client directly
export const __setRedisClient = (c: any) => {
  client = c;
};

export default client;
