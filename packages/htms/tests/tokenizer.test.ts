import './fixtures/crypto.mock';

import { describe, expect, it } from 'vitest';

import { createHtmsTokenizer, createStringStream } from '../src';
import { mockRandomUUIDOnce } from './fixtures/crypto.mock';
import { collect } from './fixtures/stream.helpers';

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
});
