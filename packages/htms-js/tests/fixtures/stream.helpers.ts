import { ReadableStream } from 'node:stream/web';

export async function collect<T>(stream: ReadableStream<T>): Promise<T[]> {
  const chunks: T[] = [];

  for await (const chunk of stream.values()) {
    chunks.push(chunk);
  }

  return chunks;
}

export async function collectString(stream: ReadableStream): Promise<string> {
  const output = await collect(stream);

  return output.join('');
}

export async function collectBuffer(stream: ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of stream.values()) {
    if (chunk && chunk.buffer instanceof ArrayBuffer) {
      chunks.push(Buffer.from(chunk.buffer));
    } else {
      chunks.push(Buffer.from(String(chunk)));
    }
  }

  return Buffer.concat(chunks);
}
