import { ReadableStream } from 'node:stream/web';

export async function collect<T>(stream: ReadableStream<T>): Promise<T[]> {
  const chunks: T[] = [];

  for await (const chunk of stream.values()) {
    chunks.push(chunk);
  }

  return chunks;
}
