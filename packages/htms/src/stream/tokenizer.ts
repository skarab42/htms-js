import { randomUUID } from 'node:crypto';
import { TransformStream } from 'node:stream/web';

import { RewritingStream } from 'parse5-html-rewriting-stream';

export type StartTag = Parameters<RewritingStream['emitStartTag']>[0];
export type EndTag = Parameters<RewritingStream['emitEndTag']>[0];
export type Attribute = StartTag['attrs'][number];

export type TokenType = 'startTag' | 'endTag' | 'rawHtml' | 'htmsTag';

export interface BaseToken {
  type: TokenType;
  html: string;
}

export interface StartTagToken extends BaseToken {
  type: 'startTag';
  tag: StartTag;
}

export interface EndTagToken extends BaseToken {
  type: 'endTag';
  tag: EndTag;
}

export interface RawHtmlToken extends BaseToken {
  type: 'rawHtml';
}

export interface TaskInfo {
  name: string;
  uuid: string;
}

export interface HtmsTagToken extends BaseToken {
  type: 'htmsTag';
  tag: StartTag;
  taskInfo: TaskInfo;
}

export type Token = StartTagToken | EndTagToken | HtmsTagToken | RawHtmlToken;

export function findAttribute(tag: StartTag, name: string): Attribute | undefined {
  return tag.attrs.find((attribute) => attribute.name === name);
}

export type TokenizerStream = TransformStream<string | Buffer, Token>;

export function createHtmsTokenizer(): TokenizerStream {
  const rewriter = new RewritingStream();

  return new TransformStream({
    start(controller) {
      rewriter.on('startTag', (tag, html) => {
        const htmsAttribute = findAttribute(tag, 'data-htms');

        if (htmsAttribute === undefined) {
          controller.enqueue({ type: 'startTag', tag, html });
        } else {
          const taskInfo = { name: htmsAttribute.value, uuid: randomUUID() };

          controller.enqueue({ type: 'htmsTag', tag, html, taskInfo });
        }
      });

      rewriter.on('endTag', (tag, html) => {
        controller.enqueue({ type: 'endTag', tag, html });
      });

      rewriter.on('data', (html) => {
        controller.enqueue({ type: 'rawHtml', html });
      });

      rewriter.on('finish', () => {
        controller.terminate();
      });
    },
    transform(chunk) {
      rewriter.write(chunk);
    },
    flush() {
      rewriter.end();
    },
  });
}
