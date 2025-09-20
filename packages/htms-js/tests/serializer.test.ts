import './fixtures/crypto.mock.js';

import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  createFileStream,
  createHtmsResolver,
  createHtmsSerializer,
  createHtmsTokenizer,
  createStringStream,
  type Resolver,
} from '../src/index.js';
import { mockRandomUUIDIncrement } from './fixtures/crypto.mock.js';
import { collectString } from './fixtures/stream.helpers.js';

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
      <script data-htms-remove-on-cleanup>"use strict";var htms=(()=>{var s=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var M=Object.prototype.hasOwnProperty;var h=(e,t)=>{for(var r in t)s(e,r,{get:t[r],enumerable:!0})},C=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of b(t))!M.call(e,n)&&n!==r&&s(e,n,{get:()=>t[n],enumerable:!(o=f(t,n))||o.enumerable});return e};var g=e=>C(s({},"__esModule",{value:!0}),e);var A={};h(A,{HTMLChunk:()=>i,cleanup:()=>y,commit:()=>l,parseCommitMode:()=>u,removeHtmsAttributes:()=>p,setup:()=>x,toFragment:()=>d});var k=["replace","content","append","prepend","before","after"],a="replace";function c(e){return k.includes(e)}function u(e){return c(e)?e:(console.error(\`[htms-chunk] unknown commit mode '\${e}', fallback to '\${a}'\`),a)}function d(e){let t=document.createElement("template");return t.innerHTML=e,t.content}function l(e,t,r){let o=d(t);switch(r){case"content":{e.replaceChildren(o),e.setAttribute("aria-busy","false");break}case"append":{e.append(o),e.setAttribute("aria-busy","false");break}case"prepend":{e.prepend(o),e.setAttribute("aria-busy","false");break}case"before":{e.before(o);break}case"after":{e.after(o);break}default:{e.replaceWith(o);break}}}function p(e){for(let t of e.attributes)t.name.startsWith("data-htms")&&e.removeAttribute(t.name)}var i=class extends HTMLElement{connectedCallback(){let t=this.getAttribute("uuid"),r=this.getAttribute("commit"),o=this.getAttribute("partial");if(!t){console.error("[htms-chunk] missing 'uuid' attribute:",this);return}let n=\`[data-htms-uuid="\${t}"]\`,m=document.querySelector(n);if(!m){console.error(\`[htms-chunk] target element not found with selector '\${n}'\`);return}requestAnimationFrame(()=>{l(m,this.innerHTML,u(r)),(typeof o!="string"||o.trim()==="false")&&p(m),this.remove()})}};function x(){customElements.get("htms-chunk")||customElements.define("htms-chunk",i)}function y(){for(let e of document.querySelectorAll("[data-htms-remove-on-cleanup]"))e.remove()}return g(A);})();
      </script>
      <script data-htms-remove-on-cleanup>htms.setup();</script>
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
        <htms-chunk uuid="uuid-test-0000-0000-mock" commit="replace">resolved task: getNews</htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0001-mock" commit="replace">resolved task: getArticles</htms-chunk>
      <script data-htms-remove-on-cleanup>htms.cleanup()</script>
      </body>
      </html>"
    `);
  });

  it('should serialize a simple html file with [data-htms] attribute', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    mockRandomUUIDIncrement();

    const html = '<div data-htms="goodTask"/>\n<div data-htms="badTask"/>\n';
    const input = createStringStream(html);
    const resolver: Resolver = {
      resolve(info) {
        return () => {
          if (info.name === 'badTask') {
            throw new Error(`Oupsy! Something wrong appended in this task: ${info.name}`);
          }

          return Promise.resolve(`good task done: ${info.name}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer({ debug: false }));

    const outputString = await collectString(output);

    expect(consoleErrorMock).toHaveBeenCalledExactlyOnceWith(
      'Unhandled Task Error',
      expect.objectContaining({
        message: 'Oupsy! Something wrong appended in this task: badTask',
      }),
    );

    expect(outputString).toMatchInlineSnapshot(`
      "<div data-htms="goodTask" data-htms-uuid="uuid-test-0000-0000-mock"/>
      <div data-htms="badTask" data-htms-uuid="uuid-test-0000-0001-mock"/>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="replace">good task done: goodTask</htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0001-mock">
      <div data-htms-error>
      <h2>Unhandled Task Error</h2>
      <p>Oops! We hit an unexpected error here.</p>
      <p>Please contact the site administrator if the issue persists.</p>
      </div>
      </htms-chunk>
      "
    `);
  });

  it('should serialize a simple html file with [data-htms] attribute (debug = true)', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    mockRandomUUIDIncrement();

    const html = '<div data-htms="goodTask"/>\n<div data-htms="badTask"/>\n';
    const input = createStringStream(html);

    const resolver: Resolver = {
      resolve(info) {
        return () => {
          if (info.name === 'badTask') {
            throw new Error(`Oupsy! Something wrong appended in this task: ${info.name}`);
          }

          return Promise.resolve(`good task done: ${info.name}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer({ debug: true }));

    const outputString = await collectString(output);

    expect(consoleErrorMock).toHaveBeenCalledExactlyOnceWith(
      'Unhandled Task Error',
      expect.objectContaining({
        message: 'Oupsy! Something wrong appended in this task: badTask',
      }),
    );

    // NOTE: token.value is stripped by JSON.stringify()
    expect(outputString).toMatchInlineSnapshot(`
      "<div data-htms="goodTask" data-htms-uuid="uuid-test-0000-0000-mock"/>
      <div data-htms="badTask" data-htms-uuid="uuid-test-0000-0001-mock"/>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="replace">good task done: goodTask</htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0001-mock">
      <div data-htms-error>
      <h2>Unhandled Task Error</h2>
      <pre>error: Oupsy! Something wrong appended in this task: badTask
      token: {
        "type": "task",
        "name": "badTask",
        "uuid": "uuid-test-0000-0001-mock",
        "commit": "replace"
      }</pre>
      </div>
      </htms-chunk>
      "
    `);
  });

  it('should serialize a simple html file with [data-htms] and [data-htms-value] attribute', async () => {
    mockRandomUUIDIncrement();

    const html = `<div data-htms="goodTask" data-htms-value="{ life: 42, enabled: true }" />\n`;
    const input = createStringStream(html);
    let result: unknown;
    const resolver: Resolver = {
      resolve(info) {
        return (value) => {
          result = value;

          return Promise.resolve(`resolved task: ${info.name} with value: ${JSON.stringify(value)}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());

    const outputString = await collectString(output);

    expect(result).toStrictEqual({ enabled: true, life: 42 });
    expect(outputString).toMatchInlineSnapshot(`
      "<div data-htms="goodTask" data-htms-value="{ life: 42, enabled: true }" data-htms-uuid="uuid-test-0000-0000-mock"/>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="replace">resolved task: goodTask with value: {"life":42,"enabled":true}</htms-chunk>
      "
    `);
  });

  it('should throws an error if [data-htms-value] is not a valid JSON value', async () => {
    mockRandomUUIDIncrement();

    const html = `<div data-htms="badTask" data-htms-value="1 + 1" />\n`;
    const input = createStringStream(html);
    const resolver: Resolver = {
      resolve(info) {
        return () => {
          return Promise.resolve(`resolved task: ${info.name}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());

    await expect(collectString(output)).rejects.toThrowError(
      "Failed to parse [data-htms-value] at [1:1]: SyntaxError: JSON5: invalid character '+' at 1:3",
    );
  });

  it('should add aria attributes if [data-htms-commit="content"]', async () => {
    mockRandomUUIDIncrement();

    const html = `<div data-htms="goodTask" data-htms-commit="content" />\n`;
    const input = createStringStream(html);
    let result: unknown;
    const resolver: Resolver = {
      resolve(info) {
        return (value) => {
          result = value;

          return Promise.resolve(`resolved task: ${info.name} with value: ${JSON.stringify(value)}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());

    const outputString = await collectString(output);

    expect(result).toBeUndefined();
    expect(outputString).toMatchInlineSnapshot(`
      "<div data-htms="goodTask" data-htms-commit="content" data-htms-uuid="uuid-test-0000-0000-mock" role="status" aria-busy="true"/>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="content">resolved task: goodTask with value: undefined</htms-chunk>
      "
    `);
  });

  it('should commit partial chunks', async () => {
    mockRandomUUIDIncrement();

    const html = `<div data-htms="partialTask" />\n`;
    const input = createStringStream(html);
    const resolver: Resolver = {
      resolve(info) {
        return (value, api) => {
          api.commit('<div>First partial chunk</div>', { mode: 'before' });
          api.commit('<div>Second partial chunk</div>');
          api.commit('<div>Third partial chunk</div>', { mode: 'after' });

          return Promise.resolve(`resolved task: ${info.name} with parameters: ${JSON.stringify(value)}`);
        };
      },
    };

    const output = input
      .pipeThrough(createHtmsTokenizer())
      .pipeThrough(createHtmsResolver(resolver))
      .pipeThrough(createHtmsSerializer());

    const outputString = await collectString(output);

    expect(outputString).toMatchInlineSnapshot(`
      "<div data-htms="partialTask" data-htms-uuid="uuid-test-0000-0000-mock"/>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="before" partial="true"><div>First partial chunk</div></htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="append" partial="true"><div>Second partial chunk</div></htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="after" partial="true"><div>Third partial chunk</div></htms-chunk>
      <htms-chunk uuid="uuid-test-0000-0000-mock" commit="replace">resolved task: partialTask with parameters: undefined</htms-chunk>
      "
    `);
  });
});
