import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

import type { Resolver, ResolveTask, Task, TaskInfo } from '../stream/index.js';

function resolveModule(basePath: string, specifier: string) {
  try {
    const require = createRequire(import.meta.url);
    const modulePath = path.resolve(basePath, specifier);
    const resolvedModulePath = require.resolve(modulePath);
    const moduleUrl = url.pathToFileURL(resolvedModulePath).href;

    return { moduleUrl, resolvedModulePath };
  } catch (error) {
    throw new Error(`Module not found '${specifier}' at '${basePath}'`, { cause: error });
  }
}

export interface ModuleResolverOptions {
  basePath?: string | undefined;
  cacheModule?: boolean | undefined;
}

export class ModuleResolver implements Resolver {
  readonly #basePath: string;
  readonly #specifier: string;
  readonly #cacheModule: boolean;

  constructor(specifier: string, options?: ModuleResolverOptions) {
    const { basePath = process.cwd(), cacheModule = true } = options ?? {};

    this.#basePath = basePath;
    this.#specifier = specifier;
    this.#cacheModule = cacheModule;
  }

  async #importModule(moduleUrl: string): Promise<Record<string, ResolveTask>> {
    const taskModule = await import(this.#cacheModule ? moduleUrl : `${moduleUrl}#${Date.now()}`);

    return taskModule.default ?? taskModule;
  }

  async resolve(info: TaskInfo, specifier?: string | undefined): Promise<Task> {
    try {
      // TODO: cache module path resolution
      const moduleSpecifier = specifier ?? this.#specifier;
      const { resolvedModulePath, moduleUrl } = resolveModule(this.#basePath, moduleSpecifier);
      const taskModule = await this.#importModule(moduleUrl);
      const task = taskModule[info.name];

      if (typeof task !== 'function') {
        const error = new TypeError(`Task function '${info.name}' not found in '${resolvedModulePath}'`);

        return () => Promise.reject(error);
      }

      return task;
    } catch (error) {
      return () => Promise.reject(error);
    }
  }
}
