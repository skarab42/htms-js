import fs from 'node:fs';
import path from 'node:path';
import { ReadableStream } from 'node:stream/web';

import { ModuleResolver } from '../resolvers/index.js';
import { createHtmsResolver, type Resolver } from './resolver.js';
import { createHtmsSerializer } from './serializer.js';
import { createHtmsTokenizer } from './tokenizer.js';

export type IOStream = ReadableStream<string>;

export function createStringStream(input: string | string[]): IOStream {
  return ReadableStream.from(input);
}

export function createFileStream(filePath: string): IOStream {
  return ReadableStream.from(fs.createReadStream(filePath, { encoding: 'utf8' }));
}

export function createHtmsPipeline(inputStream: IOStream, resolver: Resolver): IOStream {
  return inputStream
    .pipeThrough(createHtmsTokenizer())
    .pipeThrough(createHtmsResolver(resolver))
    .pipeThrough(createHtmsSerializer());
}

export function createHtmsStringPipeline(rawHtml: string, resolver: Resolver): IOStream {
  return createHtmsPipeline(createStringStream(rawHtml), resolver);
}

export function createHtmsFilePipeline(filePath: string, resolver: Resolver): IOStream {
  return createHtmsPipeline(createFileStream(filePath), resolver);
}

export type ModuleExtension = 'js' | 'cjs' | 'mjs' | 'ts' | 'cts' | 'mts';

export interface ModulePipelineOptions {
  basePath?: string | undefined;
  specifier?: string | undefined;
  extension?: ModuleExtension | undefined;
}

export function createHtmsStringModulePipeline(rawHtml: string, moduleSpecifier: string): IOStream {
  return createHtmsStringPipeline(rawHtml, new ModuleResolver(moduleSpecifier));
}

function changeExtension(filePath: string, extension: ModuleExtension): string {
  return path.format({ ...path.parse(filePath), base: undefined, ext: extension });
}

export function createModuleSpecifier(filePath: string, options?: ModulePipelineOptions | undefined): string {
  const specifier = options?.specifier ?? changeExtension(filePath, options?.extension ?? 'js');

  return options?.basePath ? path.relative(options.basePath, specifier) : specifier;
}

export function createModuleResolver(filePath: string, options?: ModulePipelineOptions | undefined): ModuleResolver {
  return new ModuleResolver(createModuleSpecifier(filePath, options), options?.basePath);
}

export function createHtmsFileModulePipeline(filePath: string, options?: ModulePipelineOptions | undefined): IOStream {
  return createHtmsFilePipeline(filePath, createModuleResolver(filePath, options));
}
