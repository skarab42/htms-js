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
    throw new Error(`[htms] module not found '${specifier}' at '${basePath}'`, { cause: error });
  }
}

export interface ModuleResolverOptions {
  basePath?: string | undefined;
  cacheModule?: boolean | undefined;
}

export class ModuleResolver implements Resolver {
  readonly #resolvedModulePath: string;
  readonly #cacheModule: boolean;
  readonly #moduleUrl: string;

  constructor(specifier: string, options?: ModuleResolverOptions) {
    const { basePath = process.cwd(), cacheModule = true } = options ?? {};
    const { resolvedModulePath, moduleUrl } = resolveModule(basePath, specifier);

    this.#resolvedModulePath = resolvedModulePath;
    this.#cacheModule = cacheModule;
    this.#moduleUrl = moduleUrl;
  }

  async #importModule(): Promise<Record<string, ResolveTask>> {
    const taskModule = await import(this.#cacheModule ? this.#moduleUrl : `${this.#moduleUrl}#${Date.now()}`);

    return taskModule.default ?? taskModule;
  }

  #findTask(info: TaskInfo, taskModule: Record<string, ResolveTask>): ResolveTask {
    const task = taskModule[info.name];

    if (typeof task !== 'function') {
      throw new TypeError(`[htms] task function '${info.name}' not found in '${this.#resolvedModulePath}'`);
    }

    return task;
  }

  async resolve(info: TaskInfo): Promise<Task> {
    try {
      const taskModule = await this.#importModule();

      return this.#findTask(info, taskModule);
    } catch (error) {
      return () => Promise.reject(error);
    }
  }
}
