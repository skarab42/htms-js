import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getMatchingFilePath } from '../src/index.js';

const rootMock = path.join(import.meta.dirname, 'fixtures/html');

describe('getMatchingFilePath', () => {
  it('should returns `undefined` for non-existing file', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/non-existing.html',
      match: '**/*.html',
      index: 'index.html',
    });
    expect(result).toBeUndefined();
  });

  it('should returns matching file path when file exists', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/simple.html',
      match: '**/*.html',
      index: 'index.html',
    });
    expect(result).toBe(path.resolve(rootMock, 'simple.html'));
  });

  it('should returns `undefined` for non-matching file path', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/simple.html',
      match: 'non-existing/**/*.html',
      index: 'index.html',
    });
    expect(result).toBeUndefined();
  });

  it('should returns `index.html` for an existing directory with index file', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/',
      match: '**/*.html',
      index: 'index.html',
    });
    expect(result).toBe(path.resolve(rootMock, 'index.html'));
  });

  it('should returns `undefined` for an existing directory without index file', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/',
      match: '**/*.html',
      index: 'non-existing.html',
    });
    expect(result).toBeUndefined();
  });

  it('should returns `undefined` for index file pointing to existing directory', () => {
    const result = getMatchingFilePath({
      root: rootMock,
      url: '/',
      match: '**/*.html',
      index: '/',
    });
    expect(result).toBeUndefined();
  });
});
