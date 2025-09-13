import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { TransformStream } from 'node:stream/web';

import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  createHtmsCompressor,
  createHtmsFilePipeline,
  createModuleResolver,
  type HtmsCompressorEncoding,
  type HtmsCompressorStream,
  NoTaskFoundError,
  type Resolver,
} from 'htms-js';
import { minimatch } from 'minimatch';

interface MatchingFilePathSettings {
  url: string;
  root: string;
  index: string;
  match: string;
}

/** @internal */
export function getMatchingFilePath(settings: MatchingFilePathSettings): string | undefined {
  const { pathname } = new URL(settings.url, 'http://htms');
  const cleanPathname = pathname.replaceAll(/^\/+|\/+$/g, '');
  let filePath = path.resolve(settings.root, cleanPathname);

  if (!fs.existsSync(filePath)) {
    return;
  }

  if (minimatch(filePath, settings.match)) {
    return filePath;
  }

  let fileState = fs.statSync(filePath);

  if (!fileState.isDirectory()) {
    return;
  }

  filePath = path.resolve(filePath, settings.index);

  if (!fs.existsSync(filePath)) {
    return;
  }

  fileState = fs.statSync(filePath);

  return fileState.isFile() ? filePath : undefined;
}

export type CreateResolver = (filePath: string, basePath?: string | undefined) => Resolver;

export const encodings: HtmsCompressorEncoding[] = ['br', 'gzip', 'deflate']; // order matter

export function parseAcceptEncodings(acceptEncoding: string | undefined): HtmsCompressorEncoding[] {
  if (!acceptEncoding) {
    return [];
  }

  return acceptEncoding
    .split(',')
    .map((part) => part.trim().split(';')[0] as HtmsCompressorEncoding)
    .filter((part) => encodings.includes(part));
}

function findContentEncoding(
  allowedEncodings: HtmsCompressorEncoding[],
  acceptEncodings: HtmsCompressorEncoding[],
): HtmsCompressorEncoding | undefined {
  return allowedEncodings.find((encoding) => acceptEncodings.includes(encoding));
}

export type Environment = 'development' | 'production';

export interface FastifyHtmsOptions {
  root: string;
  index?: string | undefined;
  match?: string | undefined;
  compression?: boolean | undefined;
  encodings?: HtmsCompressorEncoding[] | undefined;
  cacheModule?: boolean | undefined;
  createResolver?: CreateResolver | undefined;
  environment?: Environment | undefined;
}

type FastifyHtmsPlugin = FastifyPluginAsync<FastifyHtmsOptions>;

const fastifyHtmsCallback: FastifyHtmsPlugin = async (fastify, options) => {
  const {
    root,
    cacheModule,
    index = 'index.html',
    match = '**/*.htm?(l)',
    environment = 'development',
    compression = true,
    encodings = ['br', 'gzip', 'deflate'],
    createResolver = (filePath, basePath = root) => createModuleResolver(filePath, { basePath, cacheModule }),
  } = options;

  const debug = environment === 'development';

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'GET') {
      return;
    }

    const filePath = getMatchingFilePath({ url: request.url, root, index, match });

    if (!filePath) {
      return;
    }

    try {
      fastify.log.info({ filePath }, 'create htms file module pipeline');
      fastify.log.debug(options, 'createHtmsFileModulePipeline options');

      const resolver = createResolver(filePath, path.dirname(filePath));
      const stream = createHtmsFilePipeline(filePath, resolver, { serializerOptions: { debug } });
      let compressor: HtmsCompressorStream = new TransformStream();

      if (compression) {
        const acceptEncodings = parseAcceptEncodings(request.headers['accept-encoding']);
        const contentEncoding = findContentEncoding(encodings, acceptEncodings);

        if (contentEncoding) {
          compressor = createHtmsCompressor(contentEncoding);

          reply.raw.setHeader('Content-Encoding', contentEncoding);
        }
      }

      reply.hijack();
      reply.raw.setHeader('Content-Type', 'text/html; charset=utf-8');
      await stream.pipeThrough(compressor).pipeTo(Writable.toWeb(reply.raw));
    } catch (error) {
      let title = 'Internal Server Error';
      let message = String(error);

      if (error instanceof NoTaskFoundError) {
        title = 'Task Module Not Found Error';
        message = `${error.message} for '${filePath}'`;
      }

      fastify.log.error(error, message);

      const outputMessage = debug ? `${title}: ${message}` : title;

      if (reply.raw.headersSent) {
        reply.raw.write(`<!-- ${outputMessage} -->`);
      } else {
        reply.raw.statusCode = 500;
        reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
        reply.raw.write(outputMessage);
      }
    } finally {
      reply.raw.end();
    }
  });
};

export const fastifyHtms: FastifyHtmsPlugin = fp(fastifyHtmsCallback);
