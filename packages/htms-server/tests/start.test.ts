import path from 'node:path';

import Fastify from 'fastify';
import { afterEach, beforeEach, describe, expect, it, type Mock, type MockInstance, vi } from 'vitest';

import { start } from '../src/index.js';

vi.mock('fastify');

describe('htms-server start', () => {
  let consoleLogMock: MockInstance;
  let FastifyMock: MockInstance;
  let registerMock: Mock;
  let listenMock: Mock;

  beforeEach(() => {
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    FastifyMock = (Fastify as unknown as MockInstance).mockImplementation(() => {
      registerMock = vi.fn();
      listenMock = vi.fn().mockImplementation((_, callback: () => void) => callback());

      return { register: registerMock, listen: listenMock };
    });
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('should call start (development)', async () => {
    const expectedRoot = path.resolve('./public');

    await start({ environment: 'development' });

    expect(consoleLogMock).toHaveBeenCalledTimes(3);
    expect(consoleLogMock).toHaveBeenNthCalledWith(1, '[htms-server] environment: development');
    expect(consoleLogMock).toHaveBeenNthCalledWith(2, `[htms-server] root: ${expectedRoot}`);
    expect(consoleLogMock).toHaveBeenNthCalledWith(3, '[htms-server] listening on http://localhost:4200');

    expect(FastifyMock).toHaveBeenCalledExactlyOnceWith({ logger: true });

    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(registerMock).toHaveBeenNthCalledWith(1, expect.any(Function), {
      environment: 'development',
      cacheModule: false,
      root: expectedRoot,
    });
    expect(registerMock).toHaveBeenNthCalledWith(2, expect.any(Function), {
      root: expectedRoot,
    });

    expect(listenMock).toHaveBeenCalledExactlyOnceWith(
      {
        host: 'localhost',
        port: 4200,
      },
      expect.any(Function),
    );
  });

  it('should call start (production)', async () => {
    const expectedRoot = path.resolve('./public');

    await start({ environment: 'production' });

    expect(consoleLogMock).toHaveBeenCalledTimes(3);
    expect(consoleLogMock).toHaveBeenNthCalledWith(1, '[htms-server] environment: production');
    expect(consoleLogMock).toHaveBeenNthCalledWith(2, `[htms-server] root: ${expectedRoot}`);
    expect(consoleLogMock).toHaveBeenNthCalledWith(3, '[htms-server] listening on http://localhost:4200');

    expect(FastifyMock).toHaveBeenCalledExactlyOnceWith({ logger: false });

    expect(registerMock).toHaveBeenCalledTimes(2);
    expect(registerMock).toHaveBeenNthCalledWith(1, expect.any(Function), {
      environment: 'production',
      cacheModule: true,
      root: expectedRoot,
    });
    expect(registerMock).toHaveBeenNthCalledWith(2, expect.any(Function), {
      root: expectedRoot,
    });

    expect(listenMock).toHaveBeenCalledExactlyOnceWith(
      {
        host: 'localhost',
        port: 4200,
      },
      expect.any(Function),
    );
  });
});
