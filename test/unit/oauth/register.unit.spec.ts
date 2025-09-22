import { describe, it, expect } from 'vitest';
import registerOAuth from '../../../src/routes/oauth';

describe('oauth route stub', () => {
  it('registerOAuth executes without modifying server', () => {
    const server = { hooks: [] } as any;
    const result = registerOAuth(server);
    expect(result).toBe(server);
    expect(server.hooks).toEqual([]);
  });
});
