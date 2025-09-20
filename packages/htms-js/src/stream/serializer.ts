import { TransformStream } from 'node:stream/web';

import { escapeAttribute } from 'entities/escape';
import type { CommitMode } from 'htms-dom/commit-mode';

import { getHtmsDomSource } from '../browser/index.js';
import type { ResolverToken, TaskApi, TaskToken } from './resolver.js';
import type { EndToken, StartTag, StartToken } from './tokenizer.js';

const minified = true; // TODO: make configurable
const htmsDomSource = getHtmsDomSource(minified);

interface Attribute {
  name: string;
  value?: string;
}

function formatAttributes(attributes: Attribute[]): string {
  let output = '';

  for (const attribute of attributes) {
    output += attribute.value ? ` ${attribute.name}="${escapeAttribute(attribute.value)}"` : ` ${attribute.name}"`;
  }

  return output;
}

function formatStartTag(token: StartTag): string {
  return `<${token.tagName}${formatAttributes(token.attrs)}${token.selfClosing ? '/>' : '>'}`;
}

type Controller = TransformStreamDefaultController<string>;

function setAttribute(token: StartToken, name: string, value: string): void {
  token.tag.attrs.push({ name, value });
}

function setHtmsAttribute(token: StartToken, name: string, value: string): void {
  setAttribute(token, `data-htms-${name}`, value);
}

function removeHtmsAttribute(token: StartToken, name: string): void {
  token.tag.attrs = token.tag.attrs.filter((attribute) => attribute.name !== `data-htms-${name}`);
}

function processEndTag(token: EndToken, controller: Controller): void {
  if (token.tag.tagName === 'html' || token.tag.tagName === 'body') {
    return; // skip html/body end tag
  }

  if (token.tag.tagName === 'head') {
    controller.enqueue('<style data-htms-remove-on-cleanup>[data-htms]:empty{display:none}</style>\n');
    controller.enqueue(`<script data-htms-remove-on-cleanup>${htmsDomSource}</script>\n`);
  }

  controller.enqueue(token.html);
}

interface CommitSettings {
  mode: CommitMode;
  token: TaskToken;
  controller: Controller;
  partial: boolean;
  html: string;
}

function commit(settings: CommitSettings): void {
  const attributes: Attribute[] = [
    { name: 'uuid', value: settings.token.uuid },
    { name: 'commit', value: settings.mode },
  ];

  if (settings.partial) {
    attributes.push({ name: 'partial', value: 'true' });
  }

  settings.controller.enqueue(`<htms-chunk${formatAttributes(attributes)}>${settings.html}</htms-chunk>\n`);
}

function createApi(token: TaskToken, controller: Controller): TaskApi {
  return {
    commit: (html, options) =>
      commit({ token, controller, html, mode: options?.mode ?? 'append', ...options, partial: true }),
  };
}

async function runTask(token: TaskToken, controller: Controller, debug: boolean): Promise<void> {
  try {
    const api = createApi(token, controller);

    commit({ token, controller, mode: token.commit, html: await token.task(token.value, api), partial: false });
  } catch (error_) {
    const title = 'Unhandled Task Error';
    const error = error_ instanceof Error ? error_ : new Error(String(error_));

    // TODO: add better logging strategies
    // eslint-disable-next-line no-console
    console.error(title, error);

    // TODO: make this customizable in some way...
    controller.enqueue(`<htms-chunk uuid="${token.uuid}">\n`);
    controller.enqueue(`<div data-htms-error>\n`);
    controller.enqueue(`<h2>${title}</h2>\n`);

    if (debug) {
      controller.enqueue(`<pre>`);
      controller.enqueue(`error: ${error.message}\n`);
      controller.enqueue(`token: ${JSON.stringify(token, undefined, 2)}`);
      controller.enqueue(`</pre>\n`);
    } else {
      controller.enqueue('<p>Oops! We hit an unexpected error here.</p>\n');
      controller.enqueue('<p>Please contact the site administrator if the issue persists.</p>\n');
    }

    controller.enqueue(`</div>\n`);
    controller.enqueue(`</htms-chunk>\n`);
  }
}

export class NoTaskFoundError extends Error {
  override message = 'No task found';
}

const cleanEndTag = new Set(['html', 'body']);

export type SerializerStream = TransformStream<ResolverToken, string>;

export interface HtmsSerializerOptions {
  debug?: boolean | undefined;
}

const busyStatus = new Set(['content', 'append', 'prepend']);

export function createHtmsSerializer(options?: HtmsSerializerOptions | undefined): SerializerStream {
  const { debug = false } = options ?? {};
  const seenEndTags = new Set<string>();
  const runningTasks: Promise<void>[] = [];

  let cleanNextToken = false;

  return new TransformStream({
    transform(token, controller) {
      switch (token.type) {
        case 'endTag':
        case 'htmsEndModule': {
          const tagName = token.tag.tagName.toLocaleLowerCase();

          seenEndTags.add(tagName);
          processEndTag(token, controller);
          cleanNextToken = cleanEndTag.has(tagName);
          break;
        }
        case 'htmsTag': {
          removeHtmsAttribute(token, 'module');
          setHtmsAttribute(token, 'uuid', token.taskInfo.uuid);

          if (busyStatus.has(token.taskInfo.commit)) {
            setAttribute(token, 'role', 'status');
            setAttribute(token, 'aria-busy', 'true');
          }

          controller.enqueue(formatStartTag(token.tag));
          break;
        }
        case 'htmsStartModule': {
          removeHtmsAttribute(token, 'module');
          controller.enqueue(formatStartTag(token.tag));
          break;
        }
        case 'task': {
          runningTasks.push(runTask(token, controller, debug));
          break;
        }
        default: {
          let html = token.html;

          if (cleanNextToken) {
            html = html.trim();
          }

          cleanNextToken = false;
          controller.enqueue(html);
        }
      }
    },
    async flush(controller) {
      const taskFound = runningTasks.length > 0;

      if (taskFound) {
        await Promise.allSettled(runningTasks);
      }

      try {
        if (seenEndTags.has('body')) {
          controller.enqueue('<script data-htms-remove-on-cleanup>htms.cleanup()</script>\n');
          controller.enqueue('</body>\n');
        }

        if (seenEndTags.has('html')) {
          controller.enqueue('</html>');
        }

        if (!taskFound) {
          controller.error(new NoTaskFoundError());
        }
      } catch {
        // noop - Invalid state: Unable to enqueue when the stream is canceled
      } finally {
        controller.terminate();
      }
    },
  });
}
