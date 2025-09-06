// @vitest-environment jsdom
/// <reference lib="dom" />

import '../src/browser/api.js';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => callback(0));
});

beforeEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('<htms-chunk>', () => {
  it('should warn if the uuid attribute is missing', async () => {
    const warn = vi.spyOn(console, 'warn');
    const chunk = document.createElement('htms-chunk');

    document.body.append(chunk);

    expect(warn).toHaveBeenCalledWith("[htms-chunk] missing 'uuid' attribute:", expect.any(HTMLElement));
  });

  it('should warn if the target element is not found', async () => {
    const warn = vi.spyOn(console, 'warn');
    const chunk = document.createElement('htms-chunk');
    chunk.setAttribute('uuid', 'nope');

    document.body.append(chunk);

    expect(warn).toHaveBeenCalledWith(
      '[htms-chunk] target element not found with selector \'[data-htms-uuid="nope"]\'',
    );
  });

  it('replace the target element with the content of the <htms-chunk> component', async () => {
    const uuidMock = 'uuid-test-0000-0000-mock';

    const target = document.createElement('div');
    target.dataset['htmsUuid'] = uuidMock;
    document.body.append(target);

    const chunk = document.createElement('htms-chunk');
    chunk.setAttribute('uuid', uuidMock);
    chunk.innerHTML = '<span>Some contents...</span>';
    document.body.append(chunk);

    expect(document.querySelector(`[data-htms-uuid="${uuidMock}"]`)).toBeNull();
    expect(document.body.innerHTML).toContain('<span>Some contents...</span>');
    expect(document.querySelector('htms-chunk')).toBeNull();
  });
});

describe('htms.cleanup()', () => {
  it('should remove all [data-htms-remove-on-cleanup] elements', () => {
    for (let index = 0; index < 3; index++) {
      const element = document.createElement('div');
      element.dataset['htmsRemoveOnCleanup'] = '';
      document.body.append(element);
    }

    // @ts-expect-error - Element implicitly has an any type because type typeof globalThis has no index signature.
    globalThis.htms.cleanup();

    expect(document.querySelectorAll('[data-htms-remove-on-cleanup]').length).toBe(0);
  });

  it('should be not writable/configurable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'htms');

    expect(descriptor).not.toBeUndefined();
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
  });
});
