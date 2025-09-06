import './fixtures/crypto.mock';

import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createHtmsFileModulePipeline, createHtmsStringModulePipeline, createModuleSpecifier } from '../src';

const fixturesDirectory = path.resolve(import.meta.dirname, 'fixtures');

describe('createModuleSpecifier', () => {
  it('should defaults to `js` extension', () => {
    expect(createModuleSpecifier('pages/index.html')).toBe(path.normalize('pages/index.js'));
  });

  it('should swap file extension', () => {
    expect(createModuleSpecifier('pages/index.html', { extension: 'mjs' })).toBe(path.normalize('pages/index.mjs'));
  });

  it('should returns an explicit specifier override', () => {
    expect(createModuleSpecifier('pages/index.html', { specifier: 'tasks/news.ts' })).toBe('tasks/news.ts');
  });
});

describe('convenience pipelines', () => {
  it('createHtmsStringModulePipeline returns a ReadableStream<string>', () => {
    const specifier = path.join(fixturesDirectory, 'tasks', 'empty.ts');
    const stream = createHtmsStringModulePipeline('<div></div>', specifier);

    expect(stream.getReader).toBeTypeOf('function');
  });

  it('createHtmsFileModulePipeline returns a ReadableStream<string>', () => {
    const filePath = path.join(fixturesDirectory, 'html', 'simple.html');
    const specifier = path.join(fixturesDirectory, 'tasks', 'empty.ts');
    const stream = createHtmsFileModulePipeline(filePath, { specifier });

    expect(stream.getReader).toBeTypeOf('function');
  });
});
