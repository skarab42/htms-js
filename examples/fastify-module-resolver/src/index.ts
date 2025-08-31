import { Readable } from 'node:stream';

import Fastify from 'fastify';
import {
  createFileStream,
  createHtmsResolver,
  createHtmsSerializer,
  createHtmsTokenizer,
  ModuleResolver,
} from 'htms-js';

const server = Fastify();

server.get('/', (_request, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8');

  const resolver = new ModuleResolver('./src/pages/index.ts');
  const stream = createFileStream('./src/pages/index.html')
    .pipeThrough(createHtmsTokenizer())
    .pipeThrough(createHtmsResolver(resolver))
    .pipeThrough(createHtmsSerializer());

  Readable.fromWeb(stream).pipe(reply.raw);
});

await server.listen({ port: 4200 });

console.log(`Fastify listening on http://localhost:4200`);
