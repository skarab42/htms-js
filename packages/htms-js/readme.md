# htms-js 💨 Stream Async HTML, Stay SEO-Friendly

[![npm version](https://img.shields.io/npm/v/htms-js.svg?color=blue)](https://www.npmjs.com/package/htms-js)
[![build status](https://img.shields.io/github/actions/workflow/status/skarab42/htms-js/ci.yml?branch=main&label=ci)](https://github.com/skarab42/htms-js/actions)
[![codecov](https://codecov.io/github/skarab42/htms-js/branch/main/graph/badge.svg?flag=htms-js)](https://codecov.io/github/skarab42/htms-js)
[![install size](https://packagephobia.com/badge?p=htms-js)](https://packagephobia.com/result?p=htms-js)
[![license](https://img.shields.io/github/license/skarab42/htms-js)](./license.md)
[![stars](https://img.shields.io/github/stars/skarab42/htms-js?style=social)](https://github.com/skarab42/htms-js/stargazers)

> Send HTML that **renders instantly**, then **fills itself in** as async tasks complete. One response. No hydration. No empty shells.

`htms-js` is an **early-stage project**: a proposal to progressively render HTML with async functions, while staying SEO-friendly and lightweight. It's not meant as _the new default_, but as an **alternative** that can fit into many stacks or frameworks.

🦀 Rustacean? Check out [**htms-rs**](https://github.com/skarab42/htms-rs)

---

## How it works

1. **Tokenizer:** scans HTML for `data-htms`.
2. **Resolver:** maps names to async functions.
3. **Serializer:** streams HTML and emits chunks as tasks finish.
4. **Client runtime:** swaps placeholders and cleans up markers.

Result: **SEO-friendly streaming HTML** with minimal overhead.

### Try the `curl` optimized demo

```bash
$ curl -N https://htms.skarab42.dev/curl
```

[![htms streaming flow animation](https://cdn.skarab42.dev/htms/images/htms-flow-animation.webp 'htms streaming flow animation')](https://htms.skarab42.dev/curl)

### Try the (too much) dashboard demo

[![htms streaming dashboard demo](https://cdn.skarab42.dev/htms/images/htms-dashboard-demo.webp 'htms streaming dashboard demo')](https://htms.skarab42.dev/)

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

### About module resolution

When you call `createHtmsFileModulePipeline('./home-page.html')`, HTMS will automatically look for a sibling module file named `./home-page.js` and resolve tasks from there. If you want to:

- **Mix several modules on the same page** → see [Scoped modules](#scoped-modules-data-htms-module).
- **Point to another file** → use the `specifier` option in the [API](#api).
- **Provide your own logic** → see [Custom resolvers](#custom-resolvers).

---

## Examples

- [Express](https://github.com/skarab42/htms-js/tree/main/examples/express/index.ts), [Fastify](https://github.com/skarab42/htms-js/tree/main/examples/fastify/index.ts), [Hono](https://github.com/skarab42/htms-js/tree/main/examples/hono/index.ts)
- [Raw streaming](https://github.com/skarab42/htms-js/tree/main/examples/stdout/index.ts) (stdout)
- [htms server](https://github.com/skarab42/htms-js/tree/main/examples/server) (cli)

```bash
git clone https://github.com/skarab42/htms-js.git
cd htms-js
pnpm i && pnpm build
```

```bash
pnpm --filter express-example start
pnpm --filter fastify-example start
pnpm --filter hono-example start
pnpm --filter stdout-example start
pnpm --filter server-example start # this is the published dashboard demo
```

---

## HTMS attributes

### Scoped modules (`data-htms-module`)

HTMS supports scoped modules, meaning tasks can resolve from different modules depending on context. You can nest modules and HTMS will pick the right scope for each placeholder.

```html
<section data-htms-module="root-module.js">
  <div data-htms="taskA">loading task A from 'root-module.js'...</div>
  <div data-htms="taskA" data-htms-module="child-module.js">loading task A from 'child-module.js'...</div>

  <div data-htms-module="child-module.js">
    <div data-htms="taskA">loading task A from 'child-module.js'...</div>
    <div data-htms="taskA" data-htms-module="root-module.js">loading task A from 'root-module.js'...</div>
  </div>

  <div data-htms="taskB">loading task B from 'root-module.js'...</div>
  <div data-htms="taskB" data-htms-module="child-module.js">loading task B from 'child-module.js'...</div>
</section>
```

This makes it easier to compose and reuse modules without conflicts.

## Task value (`data-htms-value`)

`data-htms-value` passes **one argument** to the task.
When present, the value is parsed as **JSON5** and given to the task as its **first parameter**.
If the attribute is **omitted**, the task receives `undefined`.

- Accepted: `undefined`, `null`, booleans, numbers, strings, arrays, objects (JSON5: single quotes, unquoted keys, comments, trailing commas).
- Not accepted: functions, arbitrary JS expressions.
- Need multiple pieces of data? Pack them into **one** object or array.

### HTML examples

```html
<!-- attribute omitted → value = undefined -->
<div data-htms="loadDefaults"></div>

<!-- primitive values -->
<div data-htms="loadDefaults" data-htms-value="null"></div>
<div data-htms="loadProfile" data-htms-value="true"></div>
<div data-htms="loadUser" data-htms-value="12345"></div>
<div data-htms="loadByName" data-htms-value="'john-doe'"></div>

<!-- object / array (JSON5) -->
<div data-htms="loadFeed" data-htms-value="{ theme: 'compact', limit: 10 }"></div>
<div data-htms="renderOffer" data-htms-value="[42, { theme: 'compact' }]"></div>
```

### Task signatures (TypeScript examples)

```ts
export async function loadDefaults(value: undefined | null) {}
export async function loadProfile(value: boolean) {}
export async function loadUser(value: number) {}
export async function loadByName(value: string) {}

export async function loadFeed(value: { theme: string; limit: number }) {
  // value.theme === 'compact'
  // value.limit === 10
}

export async function renderOffer(value: [number, { theme: string }]) {
  const [offerId, options] = value;
  // offerId === 42
  // options.theme === 'compact'
}
```

### Tips

- **Keep it serializable.** Only data you could express in JSON5 should go here.
- **Prefer objects** when the meaning of fields matters: `{ id, page, sort }` is clearer than `[id, page, sort]`.
- **Strings must be quoted.** Use JSON5 single quotes in HTML to stay readable.
- **Validate inside the task.** Treat the value as untrusted input.
- **One argument by design.** If you need several inputs, bundle them: `(value)` where `value` is an object/array.

## Commit behavior (`data-htms-commit`)

Controls how the streamed result is applied to the placeholder. Default: `replace`.

| Value     | Effect                                              | DOM equivalent               | Accessibility (`aria-busy`) |
| --------- | --------------------------------------------------- | ---------------------------- | --------------------------- |
| `replace` | Replace the **placeholder node** (outer)            | `host.replaceWith(frag)`     | No                          |
| `content` | Replace the **children** of the placeholder (inner) | `host.replaceChildren(frag)` | Yes                         |
| `append`  | Append result **as last child**                     | `host.append(frag)`          | Yes                         |
| `prepend` | Insert result **as first child**                    | `host.prepend(frag)`         | Yes                         |
| `before`  | Insert result **before** the placeholder            | `host.before(frag)`          | No                          |
| `after`   | Insert result **after** the placeholder             | `host.after(frag)`           | No                          |

**HTML examples**

Assuming the streamed content is: `<div>Streamed</div>`

```html
<!-- replace (default): host node is replaced by the content -->
<div data-htms="getUser" data-htms-commit="replace">Loading…</div>
<!-- becomes -->
<div>Streamed</div>

<!-- content: keep the host, swap its children -->
<div data-htms="getUser" data-htms-commit="content">Loading…</div>
<!-- becomes -->
<div><div>Streamed</div></div>

<!-- append: add at the end of host -->
<section data-htms="getUser" data-htms-commit="append"><div>Existing</div></section>
<!-- becomes -->
<section>
  <div>Existing</div>
  <div>Streamed</div>
</section>

<!-- prepend: add at the beginning of host -->
<section data-htms="getUser" data-htms-commit="prepend"><div>Existing</div></section>
<!-- becomes -->
<section>
  <div>Streamed</div>
  <div>Existing</div>
</section>

<!-- before: insert before the host -->
<hr data-htms="getUser" data-htms-commit="before" />
<!-- becomes -->
<div>Streamed</div>
<hr />

<!-- after: insert after the host -->
<hr data-htms="getUser" data-htms-commit="after" />
<!-- becomes -->
<hr />
<div>Streamed</div>
```

**Notes**

- With `append`, `prepend`, `before`, `after`, the placeholder stays in the DOM.
- With `content`, `append`, or `prepend`, the container is kept (useful for accessibility/live regions).

### Accessibility (`content`, `append`, `prepend` modes)

When `data-htms-commit="content"`, `append`, or `prepend` is used, HTMS automatically marks the placeholder as a **polite live region** while it is pending:

- Adds `role="status"` and `aria-busy="true"` on the host before the first update.
- On the first update, sets `aria-busy="false"`, so screen readers announce the content as soon as it arrives.
- Screen readers will announce any further chunks (additional updates) directly, since `aria-busy` stays `false`.

This gives you accessible announcements out of the box, without extra markup.

**Tips for accessibility:**

- If accessibility is a priority, avoid too many updates: prefer a single update ("one shot") if the task is fast enough to prevent excessive announcements.

---

## Task API: `api.commit(...)`

Use `api.commit(mode, html)` inside a task to push partial updates before the final return.

Minimal shape (JS):

```js
// In a task: (value, api) => Promise<string>
api.commit(mode, html); // mode: 'content' | 'append' | 'prepend' | 'before' | 'after'
```

Type definitions (TypeScript):

```ts
export type Commit = 'replace' | 'content' | 'append' | 'prepend' | 'before' | 'after';

export interface TaskApi {
  // 'replace' is reserved for the final return; partial commits use the other modes
  commit(mode: Exclude<Commit, 'replace'>, html: string): void;
}

export type Task<Value = unknown> = (value: Value, api: TaskApi) => PromiseLike<string>;
```

Rules:

- Allowed modes: `content`, `append`, `prepend`, `before`, `after` (not `replace`).
- Each `api.commit(...)` emits a partial chunk applied immediately on the client.
- The final HTML is the task’s return value and uses the host’s `data-htms-commit`. With `data-htms-commit="append"`, returning `''` performs no DOM change (just cleanup).

Example (stream items with `append`):

```html
<!-- Host is the final container; we append <li> items into it -->
<ul data-htms="loadFeed" data-htms-commit="append">
  <li>Loading…</li>
</ul>
```

```js
// tasks.js
export async function loadFeed(_value, api) {
  // Clear the placeholder once (optional if already empty)
  api.commit('content', '');

  // Any async iterable of items
  for await (const item of getFeedAsyncIterable()) {
    api.commit('append', `<li>${item.title}</li>`);
  }

  // Final empty return with host commit="append" → no DOM change, just cleanup
  return '';
}
```

Notes:

- Fragments must be well‑formed HTML. Use the host as the container; don’t stream unbalanced tags.
- `content`, `append`, and `prepend` automatically manage live-region ARIA. If you need announcements, use these modes.

---

## Under the hood (advanced)

A classic htms pipeline.

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

### Building blocks

```ts
// Streams
createStringStream(input: string | string[]): ReadableStream<string>
createFileStream(filePath: string): ReadableStream<string>

// Core transforms
createHtmsTokenizer(): TransformStream<string, Token>
createHtmsResolver(resolver: Resolver): TransformStream<Token, ResolverToken>
createHtmsSerializer(): TransformStream<ResolverToken, string>
createHtmsCompressor(encoding: Encoding): TransformStream<string, string | Buffer>

// Pipelines
createHtmsStringPipeline(html: string, resolver: Resolver): ReadableStream<string>
createHtmsFilePipeline(filePath: string, resolver: Resolver): ReadableStream<string>
createHtmsStringModulePipeline(html: string, moduleSpecifier: string): ReadableStream<string>
createHtmsFileModulePipeline(filePath: string, opts?: { specifier?: string; extension?: string }): ReadableStream<string>
```

---

## API

### `createHtmsFileModulePipeline`

```ts
createHtmsFileModulePipeline(
  filePath: string,
  options?: {
    specifier?: string;
    extension?: string;
    basePath?: string;
    cacheModule?: boolean;
  }
): ReadableStream<string>
```

- **`filePath`:** path to HTML with placeholders.
- **`options.specifier`:** relative module path.
- **`options.extension`:** auto-derive tasks module by swapping extension (default: `js`).
- **`options.basePath`:** module base path.
- **`options.cacheModule`:** enable module caching.

### Resolution rules

- Uses `require.resolve` + dynamic import.
- Supports `.ts`, `.mts`, `.cts` if your runtime allows it.
- Task names = HTML placeholders.
- Named exports or a default export object are valid.

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

## Development

Quick setup

```bash
git clone https://github.com/skarab42/htms-js.git
cd htms-js
pnpm i
pnpm build
```

Common one-liners

```bash
# format + lint + typecheck + build + test
pnpm check

# run tests
pnpm test
pnpm test:watch

# lint / format
pnpm lint:check
pnpm lint:fix
pnpm format:check
pnpm format:write

# build all packages
pnpm build
```

Run examples

```bash
# run from repo root, pick one:
pnpm --filter express-example start
pnpm --filter fastify-example start
pnpm --filter hono-example start
pnpm --filter stdout-example start
pnpm --filter server-example start
```

Reset workspace

```bash
pnpm reset
```

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
