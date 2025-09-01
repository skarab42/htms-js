import { Writable } from 'node:stream';

import Fastify from 'fastify';
import { createHtmsFileModulePipeline } from 'htms-js';

const server = Fastify();

server.get('/', (_request, reply) => {
  reply.header('Content-Type', 'text/html; charset=utf-8');

  createHtmsFileModulePipeline('../_pages/index.html', { extension: 'ts' }).pipeTo(Writable.toWeb(reply.raw));
});

server.listen({ port: 4200 }, () => {
  console.log(`Fastify listening on http://localhost:4200`);
});
