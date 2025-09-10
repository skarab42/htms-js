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

export type CreateResolver = (filePath: string) => Resolver;

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
    createResolver = (filePath) => createModuleResolver(filePath, { basePath: root, cacheModule }),
  } = options;

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

      const stream = createHtmsFilePipeline(filePath, createResolver(filePath));
      let compressor: HtmsCompressorStream = new TransformStream();

      if (compression) {
        const acceptEncodings = parseAcceptEncodings(request.headers['accept-encoding']);
        const contentEncoding = findContentEncoding(encodings, acceptEncodings);

        if (contentEncoding) {
          compressor = createHtmsCompressor(contentEncoding);

          reply.raw.setHeader('Content-Encoding', contentEncoding);
        }
      }

      reply.raw.setHeader('Content-Type', 'text/html; charset=utf-8');
      await stream.pipeThrough(compressor).pipeTo(Writable.toWeb(reply.raw));
      reply.hijack();
    } catch (error) {
      const message = 'Internal Server Error';

      fastify.log.error(error, message);

      if (reply.raw.headersSent) {
        reply.raw.destroy(error instanceof Error ? error : new Error(String(error)));
      } else {
        reply.raw.statusCode = 500;
        reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
        reply.raw.end(environment === 'development' ? `${message}: ${error}` : message);
      }
    }
  });
};

export const fastifyHtms: FastifyHtmsPlugin = fp(fastifyHtmsCallback);
