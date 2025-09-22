import * as redisClient from '../plugins/redisClient';

const refreshMap = new Map<string, { username?: string; expiresAt: number }>();
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const storeRefreshToken = async (token: string, username?: string) => {
  const redis = (redisClient as any).__getRedisClient ? (redisClient as any).__getRedisClient() : (redisClient as any).default;
  if (redis) {
    await redis.setex(`refresh:${token}`, Math.ceil(REFRESH_TTL_MS / 1000), JSON.stringify({ username }));
    return;
  }
  refreshMap.set(token, { username, expiresAt: Date.now() + REFRESH_TTL_MS });
};

export const validateRefreshToken = async (token: string) => {
  if (!token) return null;
  const redis = (redisClient as any).__getRedisClient ? (redisClient as any).__getRedisClient() : (redisClient as any).default;
  if (redis) {
    const v = await redis.get(`refresh:${token}`);
    if (!v) return null;
    return JSON.parse(v);
  }
  const entry = refreshMap.get(token);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    refreshMap.delete(token);
    return null;
  }
  return entry;
};

// test helper to access internal map
// @internal
export const __getRefreshMap = () => refreshMap;
