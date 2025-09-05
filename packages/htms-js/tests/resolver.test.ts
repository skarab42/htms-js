import './fixtures/crypto.mock';

import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createFileStream, createHtmsTokenizer } from '../src';
import { createHtmsResolver, type Resolver, type TaskToken } from '../src/stream/resolver';
import { mockRandomUUIDIncrement, mockRandomUUIDOnce } from './fixtures/crypto.mock';
import { collect } from './fixtures/stream.helpers';

const simpleHtmlFixture = path.resolve(import.meta.dirname, './fixtures/html/simple.html');

describe('createHtmsResolver', () => {
  it('should resolve tasks and sort tasks at the end of the stream', async () => {
    mockRandomUUIDIncrement();

    const input = createFileStream(simpleHtmlFixture);

    const resolver: Resolver = {
      resolve(info) {
        return () => Promise.resolve(`task done: ${info.name}`);
      },
    };

    const output = input.pipeThrough(createHtmsTokenizer()).pipeThrough(createHtmsResolver(resolver));
    const tokens = await collect(output);
    const newsTaskToken = tokens[52] as TaskToken;
    const articlesTaskToken = tokens[53] as TaskToken;

    expect(tokens).toHaveLength(54);
    expect(newsTaskToken).toStrictEqual({
      type: 'task',
      name: 'getNews',
      uuid: 'uuid-test-0000-0000-mock',
      task: expect.any(Function),
    });
    expect(articlesTaskToken).toStrictEqual({
      type: 'task',
      name: 'getArticles',
      uuid: 'uuid-test-0000-0001-mock',
      task: expect.any(Function),
    });
    await expect(newsTaskToken.task()).resolves.toBe('task done: getNews');
    await expect(articlesTaskToken.task()).resolves.toBe('task done: getArticles');
  });

  it('should ...', async () => {
    mockRandomUUIDIncrement();

    const input = createFileStream(simpleHtmlFixture);

    const resolver: Resolver = {
      resolve(info) {
        return async () => {
          throw new Error(`task error: ${info.name}`);
        };
      },
    };

    const output = input.pipeThrough(createHtmsTokenizer()).pipeThrough(createHtmsResolver(resolver));
    const tokens = await collect(output);
    const articlesTaskToken = tokens[53] as TaskToken;

    expect(tokens).toHaveLength(54);

    await expect(articlesTaskToken.task()).rejects.toThrowError('task error: getArticles');
  });

  it('should throw error when the resolved task is not a function', async () => {
    mockRandomUUIDIncrement();

    const input = createFileStream(simpleHtmlFixture);

    const resolver: Resolver = {
      // @ts-expect-error - Type TaskInfo is not assignable to type Task
      resolve(info) {
        return info;
      },
    };

    await expect(
      input.pipeThrough(createHtmsTokenizer()).pipeThrough(createHtmsResolver(resolver)).pipeTo(new WritableStream()),
    ).rejects.toThrowError("the task 'getNews' should be a function, got 'object'");
  });

  it('should throw error when the resolver throw an error', async () => {
    const uuidMock = 'uuid-test-0000-0042-mock';
    mockRandomUUIDOnce(uuidMock);

    const input = createFileStream(simpleHtmlFixture);

    const resolver: Resolver = {
      resolve(info) {
        throw new Error(`test error message for task uuid: ${info.uuid}`);
      },
    };

    await expect(
      input.pipeThrough(createHtmsTokenizer()).pipeThrough(createHtmsResolver(resolver)).pipeTo(new WritableStream()),
    ).rejects.toThrowError(`test error message for task uuid: ${uuidMock}`);
  });
});
