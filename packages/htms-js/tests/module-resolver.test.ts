import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { ModuleResolver, type TaskInfo } from '../src';

const fixturesDirectory = path.resolve(import.meta.dirname, 'fixtures', 'tasks');

const uuidMock = 'uuid-test-0000-0000-mock';

describe('ModuleResolver', () => {
  it('should throws in the constructor when the module path does not exist', () => {
    expect(() => new ModuleResolver('does-not-exist.mjs', fixturesDirectory)).toThrow(
      `[htms] module not fount 'does-not-exist.mjs' at '${fixturesDirectory}'`,
    );
  });

  it('should rejects task when the function is missing', async () => {
    const file = path.resolve(fixturesDirectory, 'empty.ts');
    const resolver = new ModuleResolver(file);
    const info: TaskInfo = { name: 'notThere', uuid: uuidMock };

    const task = await resolver.resolve(info);

    await expect(task()).rejects.toThrow(`[htms] task function 'notThere' not found in '${file}'`);
  });

  it('should resolves a named exported function', async () => {
    const file = path.resolve(fixturesDirectory, 'export-named.js');
    const resolver = new ModuleResolver(file);
    const info: TaskInfo = { name: 'taskA', uuid: uuidMock };

    const task = await resolver.resolve(info);

    await expect(task()).resolves.toBe('named exported task A completed');
  });

  it('should resolves an default exported function', async () => {
    const file = path.resolve(fixturesDirectory, 'export-default.js');
    const resolver = new ModuleResolver(file);
    const info: TaskInfo = { name: 'taskB', uuid: uuidMock };

    const task = await resolver.resolve(info);

    await expect(task()).resolves.toBe('default exported task B completed');
  });
});
