import { getRedisClient } from '../plugins/redisClient';

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);
const RATE_LIMIT_WINDOW_SEC = 60; // 1 minute
const rateMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimiterHook = async (request: any, reply: any) => {
  try {
    const ip = (request.ip || request.socket?.remoteAddress || 'anonymous') as string;
    const redis = getRedisClient();
    if (redis) {
      const key = `rl:${ip}`;
      const cur = await redis.incr(key);
      if (cur === 1) {
        await redis.expire(key, RATE_LIMIT_WINDOW_SEC);
      }
      if (cur > RATE_LIMIT_MAX) {
        reply.code(429).send({ error: 'Too Many Requests' });
      }
    } else {
      const now = Date.now();
      const entry = rateMap.get(ip) as any;
      if (!entry || entry.resetAt <= now) {
        rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_SEC * 1000 });
      } else {
        entry.count += 1;
        if (entry.count > RATE_LIMIT_MAX) {
          reply.code(429).send({ error: 'Too Many Requests' });
        }
      }
    }
  } catch {
    // allow through on errors in limiter
  }
};

// test helper to reset internal rate map
export const __resetRateMap = () => {
  rateMap.clear();
};
