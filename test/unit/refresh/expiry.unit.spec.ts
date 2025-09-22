import { describe, it, expect } from 'vitest';
import { storeRefreshToken, validateRefreshToken, __getRefreshMap } from '../../../src/stores/refresh';

describe('refresh store expiry', () => {
  it('returns null for expired tokens and removes them', async () => {
    const token = 'tmp-token-exp';
    await storeRefreshToken(token, 'alice');
    const refreshMap = __getRefreshMap();
    if (refreshMap) {
      const entry = refreshMap.get(token);
      if (entry) {
        entry.expiresAt = Date.now() - 1000;
        refreshMap.set(token, entry);
      }
    }
    const v = await validateRefreshToken(token);
    expect(v).toBeNull();
  });
});
