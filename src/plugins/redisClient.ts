import { loadConfig } from '../config';
import logger from '../logger';

let client: any = null;

const log = logger.child({ module: 'redisClient' });

const initClient = () => {
  client = null;
  const cfg = loadConfig();
  const redisUrl = cfg.redis.url;
  try {
    if (process.env.__TEST_IOREDIS === '1') {
      log.debug('Using test Redis stub');
      client = {
        url: redisUrl || 'mock',
        setex: async () => {},
        get: async () => null,
        incr: async () => 1,
        expire: async () => {},
      };
    } else {
      const Redis = require('ioredis');
      if (redisUrl) {
        log.info({ url: redisUrl }, 'Initialising Redis client');
        client = new Redis(redisUrl);
      } else {
        log.debug('No Redis URL provided; Redis client disabled');
      }
    }
  } catch (error) {
    log.debug({ err: error }, 'Unable to initialise Redis client, falling back to in-memory');
    client = null;
  }
};

// initialize on module load
initClient();

// test helper to reinitialize based on current env
export const __initRedisClient = () => initClient();
export const getRedisClient = () => client;
export const __getRedisClient = () => client;

// test helper to set a fake client directly
export const __setRedisClient = (c: any) => {
  client = c;
};

export default client;
