import process from 'node:process';
import { Writable } from 'node:stream';

import {
  createFileStream,
  createHtmsResolver,
  createHtmsSerializer,
  createHtmsTokenizer,
  ModuleResolver,
} from 'htms-js';

const resolver = new ModuleResolver('./src/pages/index.ts');

createFileStream('./src/pages/index.html')
  .pipeThrough(createHtmsTokenizer())
  .pipeThrough(createHtmsResolver(resolver))
  .pipeThrough(createHtmsSerializer())
  .pipeTo(Writable.toWeb(process.stdout));

// or you can use the following line as a shortcut
//  createHtmsFileModulePipeline('./src/pages/index.html', { extension: 'ts' }).pipeTo(Writable.toWeb(process.stdout));
