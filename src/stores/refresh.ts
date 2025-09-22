import * as redisClient from '../plugins/redisClient';
import logger from '../logger';

const refreshMap = new Map<string, { username?: string; expiresAt: number }>();
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const log = logger.child({ module: 'refreshStore' });

export const storeRefreshToken = async (token: string, username?: string) => {
  const redis = (redisClient as any).__getRedisClient ? (redisClient as any).__getRedisClient() : (redisClient as any).default;
  if (redis) {
    await redis.setex(`refresh:${token}`, Math.ceil(REFRESH_TTL_MS / 1000), JSON.stringify({ username }));
    log.debug({ username }, 'stored refresh token in redis');
    return;
  }
  refreshMap.set(token, { username, expiresAt: Date.now() + REFRESH_TTL_MS });
  log.debug({ username }, 'stored refresh token in memory');
};

export const validateRefreshToken = async (token: string) => {
  if (!token) {
    log.warn('validate refresh token called without token');
    return null;
  }
  const redis = (redisClient as any).__getRedisClient ? (redisClient as any).__getRedisClient() : (redisClient as any).default;
  if (redis) {
    const v = await redis.get(`refresh:${token}`);
    if (!v) {
      log.debug('refresh token not found in redis');
      return null;
    }
    try {
      const parsed = JSON.parse(v);
      log.debug({ username: parsed?.username }, 'refresh token validated via redis');
      return parsed;
    } catch (error) {
      log.error({ err: error }, 'failed to parse refresh token payload from redis');
      // malformed payload stored in redis; treat as missing token
      return null;
    }
  }
  const entry = refreshMap.get(token);
  if (!entry) {
    log.debug('refresh token not found in memory');
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    refreshMap.delete(token);
    log.warn({ username: entry.username }, 'refresh token expired (memory)');
    return null;
  }
  log.debug({ username: entry.username }, 'refresh token validated via memory');
  return entry;
};

// test helper to access internal map
// @internal
export const __getRefreshMap = () => refreshMap;
