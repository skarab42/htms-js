/* eslint-disable no-console */
import path from 'node:path';

import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyLoggerOptions } from 'fastify';
import { encodings, type Environment, fastifyHtms } from 'fastify-htms';

export interface StartOptions {
  port?: number | undefined;
  host?: string | undefined;
  root?: string | undefined;
  environment?: Environment | undefined;
  compression?: boolean | undefined;
  cacheModule?: boolean | undefined;
  logger?: FastifyLoggerOptions | boolean | undefined;
}

export async function start(options?: StartOptions | undefined): Promise<void> {
  const {
    port = 4200,
    host = 'localhost',
    root = './public',
    environment = 'production',
    compression = true,
    logger = environment !== 'production',
    cacheModule = environment === 'production',
  } = options || {};

  const absoluteRoot = path.isAbsolute(root) ? root : path.resolve(process.cwd(), root);

  console.log(`[htms-server] environment: ${environment}`);
  console.log(`[htms-server] root: ${absoluteRoot}`);

  const server = Fastify({ logger });

  if (compression) {
    const fastifyCompress = await import('@fastify/compress');

    await server.register(fastifyCompress.default, { global: true, encodings });
  }

  await server.register(fastifyHtms, { root: absoluteRoot, environment, encodings, cacheModule });
  await server.register(fastifyStatic, { root: absoluteRoot });

  server.listen({ host, port }, () => {
    console.log(`[htms-server] listening on http://${host}:${port}`);
  });
}
