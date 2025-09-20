// @vitest-environment jsdom
/// <reference lib="dom" />

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { cleanup, setup } from '../src';
import type { CommitMode } from '../src/commit-mode';

function createHost(uuid: string, html = ''): void {
  const host = document.createElement('div');
  host.classList.add('host');
  host.dataset['htmsUuid'] = uuid;
  host.innerHTML = html;
  document.body.append(host);
}

function createChunk(uuid: string, commit: CommitMode): void {
  const chunk = document.createElement('htms-chunk');
  chunk.setAttribute('uuid', uuid);
  chunk.setAttribute('commit', commit);
  chunk.innerHTML = '<span>contents...</span>';
  document.body.append(chunk);
}

function createPartialChunk(uuid: string, commit: CommitMode, html: string): void {
  const chunk = document.createElement('htms-chunk');
  chunk.setAttribute('uuid', uuid);
  chunk.setAttribute('commit', commit);
  chunk.setAttribute('partial', '');
  chunk.innerHTML = `\n${html}`;
  document.body.append(chunk);
}

beforeAll(() => {
  setup();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
});

beforeEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('<htms-chunk>', () => {
  it('should error if the uuid attribute is missing', async () => {
    const error = vi.spyOn(console, 'error');
    const chunk = document.createElement('htms-chunk');

    document.body.append(chunk);

    expect(error).toHaveBeenCalledWith("[htms-chunk] missing 'uuid' attribute:", expect.any(HTMLElement));
  });

  it('should error if the target element is not found', async () => {
    const error = vi.spyOn(console, 'error');
    const chunk = document.createElement('htms-chunk');
    chunk.setAttribute('uuid', 'nope');

    document.body.append(chunk);

    expect(error).toHaveBeenCalledWith(
      '[htms-chunk] target element not found with selector \'[data-htms-uuid="nope"]\'',
    );
  });

  it('replace the target element with the content of the <htms-chunk> component', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid);
    createChunk(uuid, 'replace');

    expect(document.querySelector(`[data-htms-uuid="${uuid}"]`)).toBeNull();
    expect(document.body.innerHTML).toContain('<span>contents...</span>');
    expect(document.querySelector('htms-chunk')).toBeNull();
  });
});

describe('<htms-chunk> with commit', () => {
  it('should replaces the host node', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid);
    createChunk(uuid, 'replace');

    expect(document.body.innerHTML).toMatchInlineSnapshot(`"<span>contents...</span>"`);
  });

  it('should replaces content of the host and have [aria-busy="false"]', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '<h2>title</h2>');
    createChunk(uuid, 'content');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<div class="host" aria-busy="false"><span>contents...</span></div>"`,
    );
  });

  it('should appends to the host', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '<h2>title</h2>');
    createChunk(uuid, 'append');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<div class="host" aria-busy="false"><h2>title</h2><span>contents...</span></div>"`,
    );
  });

  it('should prepends to the host', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '<h2>title</h2>');
    createChunk(uuid, 'prepend');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<div class="host" aria-busy="false"><span>contents...</span><h2>title</h2></div>"`,
    );
  });

  it('should inserts before the host', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '<h2>title</h2>');
    createChunk(uuid, 'before');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<span>contents...</span><div class="host"><h2>title</h2></div>"`,
    );
  });

  it('should inserts after the host', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '<h2>title</h2>');
    createChunk(uuid, 'after');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<div class="host"><h2>title</h2></div><span>contents...</span>"`,
    );
  });
});

describe('<htms-chunk> with partial commit', () => {
  it('should appends partial chunk to the host', async () => {
    const uuid = 'uuid-test-0000-0000-mock';

    createHost(uuid, '\n<h2>host-title</h2>');
    createPartialChunk(uuid, 'prepend', '<h1>chunk-1</h1>');
    createPartialChunk(uuid, 'append', '<article>chunk-2</article>');
    createPartialChunk(uuid, 'append', '<article>chunk-3</article>');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `
      "<div class="host" data-htms-uuid="uuid-test-0000-0000-mock" aria-busy="false">
      <h1>chunk-1</h1>
      <h2>host-title</h2>
      <article>chunk-2</article>
      <article>chunk-3</article></div>"
    `,
    );

    // should insert the last chunk after host and remove [data-htms-uuid] attribute on it
    createChunk(uuid, 'after');

    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `
      "<div class="host" aria-busy="false">
      <h1>chunk-1</h1>
      <h2>host-title</h2>
      <article>chunk-2</article>
      <article>chunk-3</article></div><span>contents...</span>"
    `,
    );
  });
});

describe('htms.cleanup()', () => {
  it('should remove all [data-htms-remove-on-cleanup] elements', () => {
    for (let index = 0; index < 3; index++) {
      const element = document.createElement('div');
      element.dataset['htmsRemoveOnCleanup'] = '';
      document.body.append(element);
    }

    cleanup();

    expect(document.querySelectorAll('[data-htms-remove-on-cleanup]').length).toBe(0);
  });
});
