import { TransformStream } from 'node:stream/web';

import { escapeAttribute } from 'entities/escape';

import { getApiSource } from '../browser/index.js';
import type { ResolverToken, TaskToken } from './resolver.js';
import type { EndToken, StartTag, StartToken } from './tokenizer.js';

const browserApiSource = getApiSource();

function formatStartTag(token: StartTag): string {
  let output = `<${token.tagName}`;

  for (const attribute of token.attrs) {
    output += ` ${attribute.name}="${escapeAttribute(attribute.value)}"`;
  }

  output += token.selfClosing ? '/>' : '>';

  return output;
}

type Controller = TransformStreamDefaultController<string>;

function setHtmsAttribute(token: StartToken, name: string, value: string): void {
  token.tag.attrs.push({ name: `data-htms-${name}`, value });
}

function removeHtmsAttribute(token: StartToken, name: string): void {
  token.tag.attrs = token.tag.attrs.filter((attribute) => attribute.name !== `data-htms-${name}`);
}

function processEndTag(token: EndToken, controller: Controller): void {
  if (token.tag.tagName === 'html') {
    return; // skip html end tag
  }

  if (token.tag.tagName === 'body') {
    controller.enqueue(`<script data-htms-remove-on-cleanup>${browserApiSource}</script>\n`);
    return; // skip body end tag
  }

  if (token.tag.tagName === 'head') {
    controller.enqueue('<style data-htms-remove-on-cleanup>[data-htms]:empty{display:none}</style>\n');
  }

  controller.enqueue(token.html);
}

async function runTask(token: TaskToken, controller: Controller, debug: boolean): Promise<void> {
  try {
    const output = await token.task();

    controller.enqueue(`<htms-chunk uuid="${token.uuid}">${output}</htms-chunk>\n`);
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

export function createHtmsSerializer(options?: HtmsSerializerOptions | undefined): SerializerStream {
  const { debug = false } = options ?? {};
  const seenEndTags = new Set<string>();
  const taskTokens: TaskToken[] = [];

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
          controller.enqueue(formatStartTag(token.tag));
          break;
        }
        case 'htmsStartModule': {
          removeHtmsAttribute(token, 'module');
          controller.enqueue(formatStartTag(token.tag));
          break;
        }
        case 'task': {
          taskTokens.push(token);
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
      const taskFound = taskTokens.length > 0;

      if (taskFound) {
        await Promise.allSettled(taskTokens.map((token) => runTask(token, controller, debug)));
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
