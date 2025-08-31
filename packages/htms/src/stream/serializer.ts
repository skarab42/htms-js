import { TransformStream } from 'node:stream/web';

import { escapeAttribute } from 'entities/escape';

import { getApiSource } from '../browser';
import type { ResolverToken, TaskToken } from './resolver';
import type { EndTagToken, HtmsTagToken, StartTag } from './tokenizer';

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

function transformHtmsTag(token: HtmsTagToken, controller: Controller) {
  token.tag.attrs.push({ name: 'data-htms-uuid', value: token.taskInfo.uuid });
  controller.enqueue(formatStartTag(token.tag));
}

function transformEndTag(token: EndTagToken, controller: Controller) {
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

async function runTask(token: TaskToken, controller: Controller): Promise<void> {
  try {
    const output = await token.task();

    controller.enqueue(`<htms-chunk uuid="${token.uuid}">${output}</htms-chunk>\n`);
  } catch (error) {
    controller.error(error);
  }
}

const cleanEndTag = new Set(['html', 'body']);

export function createHtmsSerializer(): TransformStream<ResolverToken, string> {
  const seenEndTags = new Set<string>();
  const taskTokens: TaskToken[] = [];

  let cleanNextToken = false;

  return new TransformStream({
    transform(token, controller) {
      switch (token.type) {
        case 'endTag': {
          const tagName = token.tag.tagName.toLocaleLowerCase();

          seenEndTags.add(tagName);
          transformEndTag(token, controller);
          cleanNextToken = cleanEndTag.has(tagName);
          break;
        }
        case 'htmsTag': {
          transformHtmsTag(token, controller);
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
      await Promise.allSettled(taskTokens.map((token) => runTask(token, controller)));

      if (seenEndTags.has('body')) {
        controller.enqueue('<script data-htms-remove-on-cleanup>htms.cleanup()</script>\n');
        controller.enqueue('</body>\n');
      }

      if (seenEndTags.has('html')) {
        controller.enqueue('</html>');
      }

      controller.terminate();
    },
  });
}
