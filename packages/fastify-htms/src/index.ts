import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';

import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { createHtmsFilePipeline, createModuleResolver, type Resolver } from 'htms-js';
import { minimatch } from 'minimatch';

export type CreateResolver = (filePath: string) => Resolver;

export interface FastifyHtmsOptions {
  root: string;
  index?: string | undefined;
  match?: string | undefined;
  createResolver?: CreateResolver | undefined;
}

type FastifyHtmsPlugin = FastifyPluginAsync<FastifyHtmsOptions>;

const fastifyHtmsCallback: FastifyHtmsPlugin = async (fastify, options) => {
  const { root, index = 'index.html', match = '**/*.htm?(l)', createResolver = createModuleResolver } = options;

  function getMatchingFilePath(pathname: string): string | undefined {
    const cleanPathname = pathname.replaceAll(/^\/+|\/+$/g, '');
    let filePath = path.resolve(root, cleanPathname);

    if (!fs.existsSync(filePath)) {
      return;
    }

    if (minimatch(filePath, match)) {
      return filePath;
    }

    let fileState = fs.statSync(filePath);

    if (fileState.isDirectory()) {
      filePath = path.resolve(filePath, index);
      fileState = fs.statSync(filePath);
    }

    if (fileState.isFile()) {
      return filePath;
    }

    return;
  }

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.method !== 'GET') {
      return;
    }

    const { pathname } = new URL(request.url, 'http://htms');
    const filePath = getMatchingFilePath(pathname);

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
      if (error instanceof Error && error.name === 'AbortError') {
        fastify.log.debug(error, 'abort error');
      } else {
        fastify.log.error(error, 'unhandled error');
      }
    }
  });
};

export const fastifyHtms: FastifyHtmsPlugin = fp(fastifyHtmsCallback);
