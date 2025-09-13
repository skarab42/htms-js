import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import url from 'node:url';

import type { Resolver, ResolveTask, Task, TaskInfo } from '../stream/index.js';

interface ResolvedModule {
  url: string;
  path: string;
}

function resolveModule(basePath: string, specifier: string): ResolvedModule {
  try {
    const require = createRequire(import.meta.url);
    const modulePath = path.resolve(basePath, specifier);
    const resolvedModulePath = require.resolve(modulePath);
    const moduleUrl = url.pathToFileURL(resolvedModulePath).href;

    return { url: moduleUrl, path: resolvedModulePath };
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
  readonly #resolvedModules = new Map<string, ResolvedModule>();

  constructor(specifier: string, options?: ModuleResolverOptions) {
    const { basePath = process.cwd(), cacheModule = true } = options ?? {};

    this.#basePath = basePath;
    this.#specifier = specifier;
    this.#cacheModule = cacheModule;
  }

  #resolveModule(specifier: string): ResolvedModule {
    let resolvedModule = this.#resolvedModules.get(specifier);

    if (!resolvedModule) {
      resolvedModule = resolveModule(this.#basePath, specifier);

      this.#resolvedModules.set(specifier, resolvedModule);
    }

    return resolvedModule;
  }

  async #importModule(moduleUrl: string): Promise<Record<string, ResolveTask>> {
    const taskModule = await import(this.#cacheModule ? moduleUrl : `${moduleUrl}#${Date.now()}`);

    return taskModule.default ?? taskModule;
  }

  async resolve(info: TaskInfo, specifier?: string | undefined): Promise<Task> {
    try {
      const moduleSpecifier = specifier ?? this.#specifier;
      const resolvedModule = this.#resolveModule(moduleSpecifier);
      const taskModule = await this.#importModule(resolvedModule.url);
      const task = taskModule[info.name];

      if (typeof task !== 'function') {
        const error = new TypeError(`Task function '${info.name}' not found in '${resolvedModule.path}'`);

        return () => Promise.reject(error);
      }

      return task;
    } catch (error) {
      return () => Promise.reject(error);
    }
  }
}
