import { describe, it, expect, beforeEach } from 'vitest';
import { storeRefreshToken, validateRefreshToken } from '../src/stores/refresh';

describe('refresh store (in-memory)', () => {
  beforeEach(() => {
    // refreshMap is module-scoped; to simulate fresh state we rely on tokens being unique per test
  });

  it('stores and validates a refresh token', async () => {
    const token = 'rtoken-1-' + Date.now();
    await storeRefreshToken(token, 'alice');
    const entry = await validateRefreshToken(token);
    expect(entry).toBeTruthy();
    expect(entry.username).toBe('alice');
  });

  it('returns null for unknown token', async () => {
    const entry = await validateRefreshToken('no-such-token');
    expect(entry).toBeNull();
  });
});
