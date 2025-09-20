import { randomUUID } from 'node:crypto';
import { TransformStream } from 'node:stream/web';

import { type CommitMode, commitModes, defaultCommitMode, isCommitMode } from 'htms-dom/commit-mode';
import JSON5 from 'json5';
import { RewritingStream } from 'parse5-html-rewriting-stream';

export type StartTag = Parameters<RewritingStream['emitStartTag']>[0];
export type EndTag = Parameters<RewritingStream['emitEndTag']>[0];

export type TokenType = 'startTag' | 'endTag' | 'rawHtml' | 'htmsTag' | 'htmsStartModule' | 'htmsEndModule';

export interface BaseToken {
  type: TokenType;
  tag: StartTag | EndTag;
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

export interface RawHtmlToken extends Omit<BaseToken, 'tag'> {
  type: 'rawHtml';
}

function parseCommitMode(commit: string | undefined): CommitMode {
  if (!commit) {
    return defaultCommitMode;
  }

  if (!isCommitMode(commit)) {
    throw new TypeError(`Unexpected commit mode '${commit}', expected one of '${commitModes.join('|')}'`);
  }

  return commit;
}

export interface TaskInfo {
  name: string;
  uuid: string;
  commit: CommitMode;
  value: unknown;
}

export interface HtmsTagToken extends BaseToken {
  type: 'htmsTag';
  tag: StartTag;
  taskInfo: TaskInfo;
  specifier?: string | undefined;
}

export interface HtmsStartModuleToken extends BaseToken {
  type: 'htmsStartModule';
  tag: StartTag;
  specifier: string;
}

export interface HtmsEndModuleToken extends BaseToken {
  type: 'htmsEndModule';
  tag: EndTag;
  specifier: string;
}

export type StartToken = StartTagToken | HtmsTagToken | HtmsStartModuleToken;
export type EndToken = EndTagToken | HtmsEndModuleToken;
export type Token = StartToken | EndToken | RawHtmlToken;

export function mapAttributes(tag: StartTag): Map<string, string> {
  return new Map(tag.attrs.map(({ name, value }) => [name, value]));
}

export type TokenizerStream = TransformStream<string | Buffer, Token>;

export function createHtmsTokenizer(): TokenizerStream {
  const rewriter = new RewritingStream();
  const tokenStack: StartToken[] = [];
  const scopes: string[] = [];

  return new TransformStream({
    start(controller) {
      function pushStartToken(token: StartToken): void {
        controller.enqueue(token);

        if (!token.tag.selfClosing) {
          tokenStack.push(token);
        }
      }

      rewriter.on('startTag', (tag, html) => {
        const attributes = mapAttributes(tag);

        const dataHtms = attributes.get('data-htms');
        const htmsModule = attributes.get('data-htms-module');

        if (dataHtms) {
          try {
            const htmsCommit = attributes.get('data-htms-commit');
            const htmsValue = attributes.get('data-htms-value');

            const taskInfo: TaskInfo = {
              name: dataHtms,
              uuid: randomUUID(),
              commit: parseCommitMode(htmsCommit),
              value: parseValue(htmsValue),
            };

            pushStartToken({ type: 'htmsTag', tag, html, taskInfo, specifier: htmsModule ?? scopes.at(-1) });
          } catch (error) {
            controller.error(`Failed to parse [data-htms-value] at ${formatCodeLocation(tag)}: ${error}`);
          }

          return;
        }

        if (htmsModule) {
          scopes.push(htmsModule);
          pushStartToken({ type: 'htmsStartModule', tag, html, specifier: htmsModule });
          return;
        }

        pushStartToken({ type: 'startTag', tag, html });
      });

      rewriter.on('endTag', (tag, html) => {
        const lastToken = tokenStack.pop();

        if (!lastToken) {
          controller.error(`Missing open tag: '${html}' at ${formatCodeLocation(tag)}`);
          return;
        }

        if (lastToken.tag.tagName !== tag.tagName) {
          controller.error(
            `Mismatch close tag: expected '</${lastToken.tag.tagName}>', got '${html}'  at ${formatCodeLocation(tag)}`,
          );
          return;
        }

        if (lastToken.type === 'htmsStartModule') {
          scopes.pop();
          controller.enqueue({ type: 'htmsEndModule', tag, html, specifier: lastToken.specifier });
          return;
        }

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
    flush(controller) {
      if (tokenStack.length > 0) {
        const lines = [
          `Missing close tag(s): ${tokenStack.length}`,
          tokenStack.map(({ tag }) => `- <${tag.tagName}> opened at ${formatCodeLocation(tag)}`),
        ];

        controller.error(lines.join('\n'));
      }

      rewriter.end();
    },
  });
}

function formatCodeLocation(tag: StartTag | EndTag): string {
  const { startLine = 0, startCol = 0 } = tag.sourceCodeLocation ?? {};

  return `[${startLine}:${startCol}]`;
}

function parseValue(input: string | undefined): unknown {
  const trimmedInput = input?.trim();

  if (!trimmedInput || trimmedInput === '' || trimmedInput === 'undefined') {
    return undefined;
  }

  return JSON5.parse(trimmedInput);
}
