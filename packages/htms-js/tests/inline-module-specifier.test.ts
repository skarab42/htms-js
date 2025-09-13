import './fixtures/crypto.mock.js';

import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createFileStream, createHtmsTokenizer } from '../src/index.js';
import { mockRandomUUIDIncrement } from './fixtures/crypto.mock.js';
import { collect } from './fixtures/stream.helpers.js';

const inlineModuleHtmlFixture = path.resolve(import.meta.dirname, './fixtures/html/inline-module.html');

describe('createHtmsTokenizer (inline-module-specifier)', () => {
  it('should respect module specifiers scope', async () => {
    mockRandomUUIDIncrement();

    const input = createFileStream(inlineModuleHtmlFixture);
    const output = input.pipeThrough(createHtmsTokenizer());
    const tokens = await collect(output);

    const tags = tokens
      .filter((token) => token.type === 'htmsTag' || token.type === 'htmsStartModule' || token.type === 'htmsEndModule')
      .map((token) => {
        const task = token.type === 'htmsTag' ? token.taskInfo : undefined;
        return { type: token.type, specifier: token.specifier, ...(task ? { taskName: task.name } : undefined) };
      });

    expect(tags).toStrictEqual([
      { type: 'htmsStartModule', specifier: 'root-module.js' },
      { type: 'htmsTag', specifier: 'root-module.js', taskName: 'taskA' },
      { type: 'htmsTag', specifier: 'child-module.js', taskName: 'taskA' },
      { type: 'htmsStartModule', specifier: 'child-module.js' },
      { type: 'htmsTag', specifier: 'child-module.js', taskName: 'taskA' },
      { type: 'htmsTag', specifier: 'root-module.js', taskName: 'taskA' },
      { type: 'htmsEndModule', specifier: 'child-module.js' },
      { type: 'htmsTag', specifier: 'root-module.js', taskName: 'taskB' },
      { type: 'htmsTag', specifier: 'child-module.js', taskName: 'taskB' },
      { type: 'htmsEndModule', specifier: 'root-module.js' },
    ]);
  });
});
