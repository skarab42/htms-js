import { Writable } from 'node:stream';

import Express from 'express';
import { createHtmsFileModulePipeline } from 'htms-js';

const server = Express();

server.get('/', (_request, response) => {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');

  createHtmsFileModulePipeline('../_pages/index.html', { extension: 'ts' }).pipeTo(Writable.toWeb(response));
});

server.listen(4200, () => {
  console.log('Express listening on http://localhost:4200');
});
