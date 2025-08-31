import fs from 'node:fs';
import { ReadableStream } from 'node:stream/web';

export function createStringStream(input: string | string[]): ReadableStream<string> {
  return ReadableStream.from(input);
}

export function createFileStream(input: string): ReadableStream<string> {
  return ReadableStream.from(fs.createReadStream(input, { encoding: 'utf8' }));
}
