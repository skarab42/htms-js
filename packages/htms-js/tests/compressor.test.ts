import { ReadableStream } from 'node:stream/web';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { createHtmsCompressor } from '../src/index.js';
import { collectBuffer } from './fixtures/stream.helpers.js';

describe('createHtmsCompressor', () => {
  const chunks = ['Hello ', 'streaming ', 'HTMS!'];
  const text = chunks.join('');

  const options = {
    brotli: undefined,
    gzip: undefined,
    deflate: undefined,
  };

  const config = [
    ['gzip', gunzipSync],
    ['deflate', inflateSync],
    ['br', brotliDecompressSync],
  ] as const;

  it.each(config)('should compresses with %s and is reversible', async (encoding, decompress) => {
    const compressor = createHtmsCompressor(encoding, options);
    const stream = ReadableStream.from(chunks).pipeThrough(compressor);
    const compressed = await collectBuffer(stream);
    const decompressed = decompress(compressed);
    expect(decompressed.toString('utf8')).toBe(text);
  });

  it('should passes through when encoding is unknown', async () => {
    //@ts-expect-error - TS2345: Argument of type "unknown" is not assignable to parameter of type HtmsCompressorEncoding
    const compressor = createHtmsCompressor('unknown', options);
    const stream = ReadableStream.from(chunks).pipeThrough(compressor);
    const output = await collectBuffer(stream);
    expect(output.toString('utf8')).toBe(text);
  });

  it('should handles empty input without throwing', async () => {
    const compressor = createHtmsCompressor('gzip', options);
    const stream = ReadableStream.from([]).pipeThrough(compressor);
    const output = await collectBuffer(stream);
    const decompressed = gunzipSync(output);
    expect(decompressed.toString('utf8')).toBe('');
  });
});
