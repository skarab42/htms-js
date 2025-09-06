import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';

import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createHtmsFilePipeline, createModuleResolver, type Resolver } from 'htms-js';
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

export type Environment = 'development' | 'production';

export interface FastifyHtmsOptions {
  root: string;
  index?: string | undefined;
  match?: string | undefined;
  createResolver?: CreateResolver | undefined;
  environment?: Environment | undefined;
}

type FastifyHtmsPlugin = FastifyPluginAsync<FastifyHtmsOptions>;

const fastifyHtmsCallback: FastifyHtmsPlugin = async (fastify, options) => {
  const {
    root,
    index = 'index.html',
    match = '**/*.htm?(l)',
    environment = 'development',
    createResolver = (filePath) => createModuleResolver(filePath, { basePath: root }),
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

      reply.raw.setHeader('Content-Type', 'text/html; charset=utf-8');
      await stream.pipeTo(Writable.toWeb(reply.raw));
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
