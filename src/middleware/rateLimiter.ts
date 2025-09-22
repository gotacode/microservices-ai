import config from '../config';
import logger from '../logger';
import { getRedisClient } from '../plugins/redisClient';

const RATE_LIMIT_MAX = config.rateLimit.max;
const RATE_LIMIT_WINDOW_SEC = config.rateLimit.windowSeconds; // seconds
const rateMap = new Map<string, { count: number; resetAt: number }>();

const log = logger.child({ module: 'rateLimiter' });

export const rateLimiterHook = async (request: any, reply: any) => {
  try {
    const ip = (request.ip || request.socket?.remoteAddress || 'anonymous') as string;
    const redis = getRedisClient();
    if (redis) {
      const key = `rl:${ip}`;
      const cur = await redis.incr(key);
      log.debug({ ip, counter: cur }, 'rate limiter incremented using redis');
      if (cur === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
      }
      if (cur > RATE_LIMIT_MAX) {
        log.warn({ ip, counter: cur }, 'rate limit exceeded (redis)');
        reply.code(429).send({ error: 'Too Many Requests' });
      }
    } else {
      const now = Date.now();
      const entry = rateMap.get(ip) as any;
      if (!entry || entry.resetAt <= now) {
        rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_SEC * 1000 });
      } else {
        entry.count += 1;
        log.debug({ ip, counter: entry.count }, 'rate limiter incremented using in-memory store');
        if (entry.count > RATE_LIMIT_MAX) {
          log.warn({ ip, counter: entry.count }, 'rate limit exceeded (memory)');
          reply.code(429).send({ error: 'Too Many Requests' });
        }
      }
    }
  } catch (error) {
    log.error({ err: error }, 'rate limiter failed; allowing request');
  }
};

// test helper to reset internal rate map
export const __resetRateMap = () => {
  rateMap.clear();
};
