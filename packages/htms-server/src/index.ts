import path from 'node:path';

import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyLoggerOptions } from 'fastify';
import { type Environment, fastifyHtms } from 'fastify-htms';

export interface StartOptions {
  port?: number | undefined;
  host?: string | undefined;
  root?: string | undefined;
  environment?: Environment | undefined;
  cacheModule?: boolean | undefined;
  logger?: FastifyLoggerOptions | boolean | undefined;
}

export async function start(options?: StartOptions | undefined): Promise<void> {
  const {
    port = 4200,
    host = 'localhost',
    root = path.resolve(process.cwd(), 'public'),
    environment = 'production',
    logger = environment !== 'production',
    cacheModule = environment === 'production',
  } = options || {};

  console.log(`[htms-server] environment: ${environment}`);
  console.log(`[htms-server] root: ${root}`);

  const server = Fastify({ logger });

  await server.register(fastifyHtms, { root, environment, cacheModule });
  await server.register(fastifyStatic, { root });

  server.listen({ host, port }, () => {
    console.log(`[htms-server] listening on http://${host}:${port}`);
  });
}
