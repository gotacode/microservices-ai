import { describe, it, expect } from 'vitest';
import { server, start } from '../../../src/index';

describe('index start', () => {
  it('calls start and handles listen success', async () => {
    // stub server.listen to avoid actually binding sockets
    const origListen = (server as any).listen;
    let called = false;
    (server as any).listen = async () => {
      called = true;
      return Promise.resolve();
    };
    await start();
    expect(called).toBe(true);
    // restore
    (server as any).listen = origListen;
  });

  it('handles listen failure by exiting', async () => {
    const origListen = (server as any).listen;
    const origExit = process.exit;
    let exitCode: number | undefined;
    (server as any).listen = async () => {
      throw new Error('listen fail');
    };
    // stub process.exit to capture call
    // @ts-ignore
    process.exit = (code?: number) => {
      exitCode = code;
      // throw to stop further execution
      throw new Error('exited');
    };
    let threw = false;
    try {
      await start();
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
    expect(exitCode).toBe(1);
    (server as any).listen = origListen;
    // @ts-ignore
    process.exit = origExit;
  });
});
