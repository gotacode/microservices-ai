import { describe, it, expect, vi } from 'vitest';

describe('refresh store - in-memory', () => {
  it('stores and validates a refresh token and then expires it when TTL passes', async () => {
    vi.resetModules();
    const refresh = await import('../../../src/stores/refresh');
    const map = refresh.__getRefreshMap && refresh.__getRefreshMap();
    if (map) {
      map.clear();
    }

    const token = 'token-inmemory-1';
    await refresh.storeRefreshToken(token, 'alice');

    const v = await refresh.validateRefreshToken(token);
    expect(v).toBeTruthy();
    expect((v as any).username).toBe('alice');

    // simulate expiry by setting expiresAt to past if present
    if (map && map.has(token)) {
      const entry = map.get(token);
      if (entry) {
        entry.expiresAt = Date.now() - 1000;
        map.set(token, entry);
      }
    }

    const v2 = await refresh.validateRefreshToken(token);
    expect(v2).toBeNull();
  });

  it('returns null for an already-expired token stored directly in the map', async () => {
    const refresh = await import('../../../src/stores/refresh');
    const map = refresh.__getRefreshMap && refresh.__getRefreshMap();
    if (map) {
      map.clear();
    }

    const past = Date.now() - 1000;
    if (map) {
      map.set('expired-1', { username: 'bob', expiresAt: past });
    }

    const v = await refresh.validateRefreshToken('expired-1');
    expect(v).toBeNull();
  });
});

