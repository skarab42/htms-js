import { Transform } from 'node:stream';
import { TransformStream } from 'node:stream/web';
import {
  type BrotliOptions,
  constants as ZC,
  createBrotliCompress,
  createDeflate,
  createGzip,
  type ZlibOptions,
} from 'node:zlib';

export interface HtmsCompressorOptions {
  brotli?: BrotliOptions | undefined;
  deflate?: ZlibOptions | undefined;
  gzip?: ZlibOptions | undefined;
}

export type HtmsCompressorEncoding = 'br' | 'gzip' | 'deflate';

function createCompressor(acceptEncoding: string, options?: HtmsCompressorOptions | undefined): Transform | undefined {
  const encoding = acceptEncoding.toLowerCase();

  switch (encoding) {
    case 'br': {
      return createBrotliCompress({
        flush: ZC.BROTLI_OPERATION_FLUSH,
        params: { [ZC.BROTLI_PARAM_QUALITY]: 5 },
        ...options?.brotli,
      });
    }
    case 'gzip': {
      return createGzip({ flush: ZC.Z_SYNC_FLUSH, level: 6, ...options?.gzip });
    }
    case 'deflate': {
      return createDeflate({ flush: ZC.Z_SYNC_FLUSH, level: 6, ...options?.deflate });
    }
    default: {
      return;
    }
  }
}

export type HtmsCompressorStream = TransformStream<string, Buffer>;

export function createHtmsCompressor(
  encoding: HtmsCompressorEncoding,
  options?: HtmsCompressorOptions | undefined,
): HtmsCompressorStream {
  const compressor = createCompressor(encoding, options);

  return compressor ? Transform.toWeb(compressor) : new TransformStream();
}
