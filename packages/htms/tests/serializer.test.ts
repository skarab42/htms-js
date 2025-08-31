import './fixtures/crypto.mock';

import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { createFileStream, createHtmsSerializer, createHtmsTokenizer, createStringStream } from '../src';
import { createHtmsResolver, type Resolver } from '../src/stream/resolver';
import { mockRandomUUIDIncrement } from './fixtures/crypto.mock';
import { collectString } from './fixtures/stream.helpers';

describe('createHtmsSerializer', () => {
  it('should serialize a simple html file with [data-htms] attribute', async () => {
    mockRandomUUIDIncrement();

    const file = path.resolve(import.meta.dirname, './fixtures/html/simple.html');
    const input = createFileStream(file);
    const resolver: Resolver = {
      resolve(info) {
        return () => Promise.resolve(`resolved task: ${info.name}`);
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());
    const html = await collectString(output);

    expect(html).toMatchInlineSnapshot(`
      "<!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>simple html fixture</title>
        <style data-htms-remove-on-cleanup>[data-htms]:empty{display:none}</style>
      </head>
        <body>
          <header>static header</header>
          <section>
            <h1>news</h1>
            <div data-htms="getNews" data-htms-uuid="uuid-test-0000-0000-mock">loading...</div>
          </section>
          <section>
            <h1>articles</h1>
            <div data-htms="getArticles" data-htms-uuid="uuid-test-0000-0001-mock">loading...</div>
          </section>
          <footer>static footer</footer>
        <script data-htms-remove-on-cleanup>(() => {
        customElements.define(
          'htms-chunk',
          class HTMLChunk extends HTMLElement {
            connectedCallback() {
              const uuid = this.getAttribute('uuid');

              if (!uuid) {
                console.warn('[htms-chunk] undefined uuid attribute:', this);
                return;
              }

              const selector = \`[data-htms-uuid="\${uuid}"]\`;
              const element = document.querySelector(selector);

              if (!element) {
                console.warn('[htms-chunk] element not found with selector:', selector);
                return;
              }

              requestAnimationFrame(() => {
                element.outerHTML = this.innerHTML;
                this.remove();
              });
            }
          },
        );

        function cleanup() {
          for (const element of document.querySelectorAll('[data-htms-remove-on-cleanup]')) {
            element.remove();
          }
        }

        Object.defineProperty(globalThis, 'htms', {
          value: { cleanup },
          writable: false,
          configurable: false,
        });
      })();
      </script>
      <htms-chunk uuid="uuid-test-0000-0000-mock">resolved task: getNews</htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0001-mock">resolved task: getArticles</htms-chunk>
      <script data-htms-remove-on-cleanup>htms.cleanup()</script>
      </body>
      </html>"
    `);
  });

  it('should serialize a simple html file with [data-htms] attribute', async () => {
    mockRandomUUIDIncrement();

    const html = '<div data-htms="goodTask"/>\n<div data-htms="badTask"/>\n';
    const input = createStringStream(html);
    const resolver: Resolver = {
      resolve(info) {
        return () => {
          if (info.name === 'badTask') {
            throw new Error(`Oupsy! Something wrong append in this task: ${info.name}`);
          }

          return Promise.resolve(`good task done: ${info.name}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());

    expect(await collectString(output)).toMatchInlineSnapshot(`
      "<div data-htms="goodTask" data-htms-uuid="uuid-test-0000-0000-mock"/>
      <div data-htms="badTask" data-htms-uuid="uuid-test-0000-0001-mock"/>
      <htms-chunk uuid="uuid-test-0000-0001-mock"></htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0000-mock">good task done: goodTask</htms-chunk>
      "
    `);
  });
});
