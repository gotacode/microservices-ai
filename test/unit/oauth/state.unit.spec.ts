import { describe, it, expect } from 'vitest';
import { storeState, validateAndDeleteState } from '../../../src/stores/state';

describe('oauth state store stubs', () => {
  it('storeState resolves without throwing', async () => {
    await expect(storeState('key-1')).resolves.toBeUndefined();
  });

  it('validateAndDeleteState always returns false', async () => {
    await expect(validateAndDeleteState('key-1')).resolves.toBe(false);
  });
});
