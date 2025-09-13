import fs from 'node:fs';
import path from 'node:path';
import { ReadableStream } from 'node:stream/web';

import { ModuleResolver, type ModuleResolverOptions } from '../resolvers/index.js';
import { createHtmsResolver, type Resolver } from './resolver.js';
import { createHtmsSerializer, type HtmsSerializerOptions } from './serializer.js';
import { createHtmsTokenizer } from './tokenizer.js';

export type IOStream = ReadableStream<string>;

export function createStringStream(input: string | string[]): IOStream {
  return ReadableStream.from(input);
}

export function createFileStream(filePath: string): IOStream {
  return ReadableStream.from(fs.createReadStream(filePath, { encoding: 'utf8' }));
}

export interface HtmsPipelineOptions {
  serializerOptions?: HtmsSerializerOptions | undefined;
}

export function createHtmsPipeline(
  inputStream: IOStream,
  resolver: Resolver,
  options?: HtmsPipelineOptions | undefined,
): IOStream {
  return inputStream
    .pipeThrough(createHtmsTokenizer())
    .pipeThrough(createHtmsResolver(resolver))
    .pipeThrough(createHtmsSerializer(options?.serializerOptions));
}

export function createHtmsStringPipeline(
  rawHtml: string,
  resolver: Resolver,
  options?: HtmsPipelineOptions | undefined,
): IOStream {
  return createHtmsPipeline(createStringStream(rawHtml), resolver, options);
}

export function createHtmsFilePipeline(
  filePath: string,
  resolver: Resolver,
  options?: HtmsPipelineOptions | undefined,
): IOStream {
  return createHtmsPipeline(createFileStream(filePath), resolver, options);
}

export type ModuleExtension = 'js' | 'cjs' | 'mjs' | 'ts' | 'cts' | 'mts';

export interface ModulePipelineOptions extends HtmsPipelineOptions, ModuleResolverOptions {
  specifier?: string | undefined;
  extension?: ModuleExtension | undefined;
}

export function createHtmsStringModulePipeline(
  rawHtml: string,
  moduleSpecifier: string,
  options?: HtmsPipelineOptions | undefined,
): IOStream {
  return createHtmsStringPipeline(rawHtml, new ModuleResolver(moduleSpecifier), options);
}

function changeExtension(filePath: string, extension: ModuleExtension): string {
  return path.format({ ...path.parse(filePath), base: undefined, ext: extension });
}

export function createModuleSpecifier(filePath: string, options?: ModulePipelineOptions | undefined): string {
  const specifier = options?.specifier ?? changeExtension(filePath, options?.extension ?? 'js');

  return options?.basePath ? path.relative(options.basePath, specifier) : specifier;
}

export function createModuleResolver(filePath: string, options?: ModulePipelineOptions | undefined): ModuleResolver {
  return new ModuleResolver(createModuleSpecifier(filePath, options), options);
}

export function createHtmsFileModulePipeline(filePath: string, options?: ModulePipelineOptions | undefined): IOStream {
  return createHtmsFilePipeline(filePath, createModuleResolver(filePath, options), options);
}
