import path from 'node:path';

import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyLoggerOptions } from 'fastify';
import { type Environment, fastifyHtms } from 'fastify-htms';

export interface ServeOptions {
  port?: number | undefined;
  host?: string | undefined;
  root?: string | undefined;
  environment?: Environment | undefined;
  logger?: FastifyLoggerOptions | boolean | undefined;
}

export async function start(options?: ServeOptions | undefined): Promise<void> {
  const {
    port = 4200,
    host = 'localhost',
    root = path.resolve(process.cwd(), 'public'),
    environment = 'production',
    logger = environment !== 'production',
  } = options || {};

  console.log(`[htms-server] environment: ${environment}`);
  console.log(`[htms-server] root: ${root}`);

  const server = Fastify({ logger });

  await server.register(fastifyHtms, { root, environment });
  await server.register(fastifyStatic, { root });

  server.listen({ host, port }, () => {
    console.log(`[htms-server] listening on http://${host}:${port}`);
  });
}
