import './fixtures/crypto.mock.js';

import { describe, expect, it } from 'vitest';

import { createHtmsTokenizer, createStringStream } from '../src/index.js';
import { mockRandomUUIDOnce } from './fixtures/crypto.mock.js';
import { collect } from './fixtures/stream.helpers.js';

describe('createHtmsTokenizer', () => {
  it('should tokenize a simple html string', async () => {
    const html = '<div>Hello</div>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());
    const tokens = await collect(output);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      html: '<div>',
      tag: { tagName: 'div' },
      type: 'startTag',
    });
    expect(tokens[1]).toMatchObject({
      html: 'Hello',
      type: 'rawHtml',
    });
    expect(tokens[2]).toMatchObject({
      html: '</div>',
      tag: { tagName: 'div' },
      type: 'endTag',
    });
  });

  it('should tokenize a simple html string with [data-htms] attribute', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<div data-htms="taskNameTest">...</div>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());
    const tokens = await collect(output);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      html: '<div data-htms="taskNameTest">',
      tag: { tagName: 'div' },
      type: 'htmsTag',
      specifier: undefined,
      taskInfo: {
        uuid: uuidMock,
        name: 'taskNameTest',
      },
    });
    expect(tokens[1]).toMatchObject({
      html: '...',
      type: 'rawHtml',
    });
    expect(tokens[2]).toMatchObject({
      html: '</div>',
      tag: { tagName: 'div' },
      type: 'endTag',
    });
  });

  it('should tokenize a simple html string with [data-htms] and [data-htms-module] attribute', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<div data-htms="taskNameTest" data-htms-module="../path/to/module.js">...</div>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());
    const tokens = await collect(output);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      html: '<div data-htms="taskNameTest" data-htms-module="../path/to/module.js">',
      tag: { tagName: 'div' },
      type: 'htmsTag',
      specifier: '../path/to/module.js',
      taskInfo: {
        uuid: uuidMock,
        name: 'taskNameTest',
      },
    });
  });

  it('should tokenize a simple html string with only [data-htms-module] attribute', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<div data-htms-module="../path/to/module-only.js">...</div>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());
    const tokens = await collect(output);

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toMatchObject({
      html: '<div data-htms-module="../path/to/module-only.js">',
      tag: { tagName: 'div' },
      type: 'htmsStartModule',
      specifier: '../path/to/module-only.js',
    });
    expect(tokens[1]).toMatchObject({
      html: '...',
      type: 'rawHtml',
    });
    expect(tokens[2]).toMatchObject({
      html: '</div>',
      tag: { tagName: 'div' },
      type: 'htmsEndModule',
      specifier: '../path/to/module-only.js',
    });
  });

  it('should throws error if missing end tag', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<div data-htms-module="../path/to/module-only.js">';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());

    await expect(collect(output)).rejects.toThrowError('Missing close tag(s): 1');
  });

  it('should throws error if missing start tag', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<span>hello</span></span>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());

    await expect(collect(output)).rejects.toThrowError("Missing open tag: '</span>' at [1:19]");
  });

  it('should throws error if start/end tag mismatch', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';
    mockRandomUUIDOnce(uuidMock);

    const html = '<span>hello</div>';
    const input = createStringStream(html);

    const output = input.pipeThrough(createHtmsTokenizer());

    await expect(collect(output)).rejects.toThrowError(
      "Mismatch close tag: expected '</span>', got '</div>'  at [1:12]",
    );
  });
});
