import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import * as server from '../src/index.js';

vi.mock('../src/index.js', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = (await importOriginal()) as typeof import('../src/index.js');

  return { ...actual, start: vi.fn() };
});

async function run(argv: string[]): Promise<void> {
  const process_argv = [...process.argv];
  process.argv = argv;
  await import('../src/cli.js');
  process.argv = process_argv;
}

describe('htms-server CLI', () => {
  let startMock: MockInstance;

  beforeEach(() => {
    startMock = vi.spyOn(server, 'start');
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('should call start with default options', async () => {
    await run(['node', 'htms-server', 'start']);

    expect(startMock).toHaveBeenCalledExactlyOnceWith({
      environment: 'production',
      host: 'localhost',
      port: 4200,
      root: path.resolve('./public'),
      compression: true,
      cacheModule: undefined,
      logger: undefined,
    });
  });

  it('should call start with user options', async () => {
    const customRoot = './some/dir';

    await run([
      'node',
      'htms-server',
      'start',
      '--host',
      '0.0.0.0',
      '--port',
      '5050',
      '--root',
      customRoot,
      '--environment',
      'development',
      '--logger',
      '--cache-module',
    ]);

    expect(startMock).toHaveBeenCalledExactlyOnceWith({
      environment: 'development',
      host: '0.0.0.0',
      port: 5050,
      root: path.resolve(customRoot),
      compression: true,
      cacheModule: true,
      logger: true,
    });
  });
});
