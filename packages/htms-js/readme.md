# htms-js 💨 Stream Async HTML, Stay SEO-Friendly

> Send HTML that **renders instantly**, then **fills itself in** as async tasks complete. One response. No hydration. No empty shells.

`htms-js` is an **early-stage project**: a proposal to progressively render HTML with async functions, while staying SEO-friendly and lightweight. It's not meant as _the new default_, but as an **alternative** that can fit into many stacks or frameworks.

🦀 Rustacean? Check out [**htms-rs**](https://github.com/skarab42/htms-rs)

---

## ✨ Why try it

- **Instant rendering:** browsers show HTML immediately.
- **Progressive async:** placeholders stream in as soon as ready.
- **SEO intact:** bots see full HTML.
- **Tiny runtime:** one Web Component, injected automatically.
- **Tech-agnostic:** works with Express, Fastify, Hono, workers, or even raw `stdout`.

---

## 🚀 Quick start

### 1. Install

Use your preferred package manager to install the plugin:

```bash
pnpm add htms-js
```

### 2. HTML with placeholders

```html
<!-- home-page.html -->
<!doctype html>
<html lang="en">
  <body>
    <h1>News feed</h1>
    <div data-htms="loadNews">Loading news…</div>

    <h1>User profile</h1>
    <div data-htms="loadProfile">Loading profile…</div>
  </body>
</html>
```

### 3. Async tasks

```js
// home-page.js
export async function loadNews() {
  await new Promise((r) => setTimeout(r, 100));
  return `<ul><li>Breaking story</li><li>Another headline</li></ul>`;
}

export async function loadProfile() {
  await new Promise((r) => setTimeout(r, 200));
  return `<div class="profile">Hello, user!</div>`;
}
```

### 4. Stream it (Express)

```js
import { Writable } from 'node:stream';
import Express from 'express';
import { createHtmsFileModulePipeline } from 'htms-js';

const app = Express();

app.get('/', async (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  await createHtmsFileModulePipeline('./home-page.html').pipeTo(Writable.toWeb(res));
});

app.listen(3000);
```

Visit `http://localhost:3000`: content renders immediately, then fills itself in.

> **Note:** By default, `createHtmsFileModulePipeline('./home-page.html')` resolves `./home-page.js`. To use a different file or your own [resolver](#custom-resolvers), see [API](#api).

---

## Examples

- [Express](https://github.com/skarab42/htms-js/examples/express/index.ts), [Fastify](https://github.com/skarab42/htms-js/examples/fastify/index.ts), [Hono](https://github.com/skarab42/htms-js/examples/hono/index.ts)
- [Raw streaming](https://github.com/skarab42/htms-js/examples/stdout/index.ts) (stdout)
- [htms server](https://github.com/skarab42/htms-js/examples/server) (cli)

Run `pnpm --filter (express|fastify|hono|stdout|server)-example start` to try them.

_Remember to run `pnpm i && pnpm build` first._

---

## How it works

1. **Tokenizer:** scans HTML for `data-htms`.
2. **Resolver:** maps names to async functions.
3. **Serializer:** streams HTML and emits chunks as tasks finish.
4. **Client runtime:** swaps placeholders and cleans up markers.

Result: **SEO-friendly streaming HTML** with minimal overhead.

![](images/htms-dashboard-demo.gif 'htms streaming demo')

---

## Under the hood

```ts
import process from 'node:process';
import { Writable } from 'node:stream';
import {
  createFileStream,
  createHtmsResolver,
  createHtmsSerializer,
  createHtmsTokenizer,
  ModuleResolver,
} from 'htms-js';

const resolver = new ModuleResolver('./tasks.js');

await createFileStream('./index.html')
  .pipeThrough(createHtmsTokenizer())
  .pipeThrough(createHtmsResolver(resolver))
  .pipeThrough(createHtmsSerializer())
  .pipeTo(Writable.toWeb(process.stdout));
```

Works anywhere with a `WritableStream`: File, HTTP, network, stdout, ...

---

## API

### `createHtmsFileModulePipeline`

```ts
createHtmsFileModulePipeline(
  filePath: string,
  options?: {
    specifier?: string;
    extension?: string;
  }
): ReadableStream<string>
```

- **`filePath`:** path to HTML with placeholders.
- **`options.specifier`:** explicit module path.
- **`options.extension`:** auto-derive tasks module by swapping extension (default: `js`).

### Resolution rules

- Uses `require.resolve` + dynamic import.
- Supports `.ts`, `.mts`, `.cts` if your runtime allows it.
- Task names = HTML placeholders.
- Named exports or a default export object are valid.

---

## Building blocks

```ts
// Streams
createStringStream(input: string | string[]): ReadableStream<string>
createFileStream(filePath: string): ReadableStream<string>

// Core transforms
createHtmsTokenizer(): TransformStream<string, Token>
createHtmsResolver(resolver: Resolver): TransformStream<Token, ResolverToken>
createHtmsSerializer(): TransformStream<ResolverToken, string>

// Pipelines
createHtmsStringPipeline(html: string, resolver: Resolver): ReadableStream<string>
createHtmsFilePipeline(filePath: string, resolver: Resolver): ReadableStream<string>
createHtmsStringModulePipeline(html: string, moduleSpecifier: string): ReadableStream<string>
createHtmsFileModulePipeline(filePath: string, opts?: { specifier?: string; extension?: string }): ReadableStream<string>

// Resolver class
class ModuleResolver { constructor(specifier: string) }
```

---

## Custom resolvers

A resolver follows the minimal `Resolver` contract. It doesn't run tasks, only returns a function the serializer will call.

```ts
export type Task = () => PromiseLike<string>;
export interface TaskInfo {
  name: string;
  uuid: string;
}
export interface Resolver {
  resolve(info: TaskInfo): Task | Promise<Task>;
}
```

### Example: `MapResolver`

```ts
import { createFileStream, createHtmsTokenizer, createHtmsResolver, createHtmsSerializer } from 'htms-js';
import { Writable } from 'node:stream';

class MapResolver {
  #map = new Map<string, () => Promise<string>>([
    [
      'foo',
      async () => {
        await new Promise((r) => setTimeout(r, 200));
        return '<strong>Foo ✓</strong>';
      },
    ],
    [
      'bar',
      async () => {
        await new Promise((r) => setTimeout(r, 400));
        return '<em>Bar ✓</em>';
      },
    ],
  ]);

  resolve(info: { name: string }) {
    const task = this.#map.get(info.name);
    if (!task) {
      return () => Promise.reject(new Error(`Unknown task: ${info.name}`));
    }
    return task;
  }
}

await createFileStream('./index.html')
  .pipeThrough(createHtmsTokenizer())
  .pipeThrough(createHtmsResolver(new MapResolver()))
  .pipeThrough(createHtmsSerializer())
  .pipeTo(Writable.toWeb(process.stdout));
```

### Notes

- `resolve(info)` can return a Task or Promise<Task>.
- A Task must return a string (HTML) or a promise resolving to one.
- Prefer returning a rejecting task over throwing inside `resolve()`.
- Resolvers can call APIs, databases, or microservices.

---

## Status

This is **experimental**. APIs may change.

We'd love developers to:

- **Experiment** in different contexts.
- **Find limits:** performance, DX, compatibility.
- **Challenge assumptions** and suggest alternatives.
- **See if it fits your framework or stack.**

---

## Contribute

Help explore whether streaming HTML can be practical:

- ⭐ [Star the repo](https://github.com/skarab42/htms-js)
- 🐛 [Report issues](https://github.com/skarab42/htms-js/issues)
- 💡 [Propose ideas](https://github.com/skarab42/htms-js/discussions)
- 🙏 [Open PRs](https://github.com/skarab42/htms-js/pulls)

The only way to know where this works or breaks is to **try it together**.

---

## License

MIT
