# fastify-htms

[![npm version](https://img.shields.io/npm/v/fastify-htms.svg?color=blue)](https://www.npmjs.com/package/fastify-htms)
[![build status](https://img.shields.io/github/actions/workflow/status/skarab42/htms-js/ci.yml?branch=main&label=ci)](https://github.com/skarab42/htms-js/actions)
[![codecov](https://codecov.io/github/skarab42/htms-js/branch/main/graph/badge.svg?flag=fastify-htms)](https://codecov.io/github/skarab42/htms-js)
[![install size](https://packagephobia.com/badge?p=fastify-htms)](https://packagephobia.com/result?p=fastify-htms)
[![license](https://img.shields.io/github/license/skarab42/htms-js)](./license.md)
[![stars](https://img.shields.io/github/stars/skarab42/htms-js?style=social)](https://github.com/skarab42/htms-js/stargazers)

Fastify plugin that integrates [htms-js](https://github.com/skarab42/htms-js) with Fastify.

---

## Try the live demo

- https://htms.skarab42.dev

---

## Install

Use your preferred package manager to install the plugin:

```bash
pnpm add fastify fastify-htms
```

---

## Prerequisite

Before starting the server, you need at least one HTML file and a module that exports functions used by HTMS placeholders. These functions will be called to progressively fill in the HTML while it streams.

Example setup:

```html
<!-- ./public/index.html -->
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

```js
// ./public/index.js
export async function loadNews() {
  await new Promise((r) => setTimeout(r, 100));
  return `<ul><li>Breaking story</li><li>Another headline</li></ul>`;
}

export async function loadProfile() {
  await new Promise((r) => setTimeout(r, 200));
  return `<div class="profile">Hello, user!</div>`;
}
```

When you run the server, `htms-js` will scan the HTML for elements with `data-htms` attributes, then dynamically import the functions from the matching module (`index.js`) to resolve and stream the content.

---

## Scoped modules

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

## Task parameters (`data-htms-args`)

Pass parameters to tasks via a JSON/JSON5 array stored in the `data-htms-args` attribute.

- Accepts either a **JSON/JSON5 array** (recommended) or a **comma-separated list** without brackets.
- You can also pass a **single value**; it is treated as the first argument (equivalent to wrapping it in `[...]`).
- Supports: single or double quotes, unquoted object keys, trailing commas, comments.
- **Not supported:** `undefined`, functions, arbitrary JS expressions. Use `null` when you need to indicate “no value.”

**HTML examples**

```html
<!-- JSON/JSON5 array -->
<div data-htms="renderUserCard" data-htms-args='[12345, "en-GB", { showBadges: true, theme: "compact" }]' />

<!-- Comma-separated list (equivalent to an array) -->
<div data-htms="renderFeed" data-htms-args="12345, { limit: 10, cursor: null }" />

<!-- Single value (first argument only) -->
<div data-htms="loadProfile" data-htms-args="12345" />
```

**Task examples**

```js
// page-module.js
export async function renderUserCard(userId, locale, opts) {
  // userId === 12345
  // locale === "en-GB"
  // opts === { showBadges: true, theme: "compact" }
  return `<div class="user-card">User #${userId}</div>`;
}

export async function renderFeed(userId, page) {
  // page === { limit: 10, cursor: null }
  return `<ul class="feed">...</ul>`;
}

export async function loadProfile(userId) {
  return `<div class="profile">Profile of ${userId}</div>`;
}
```

## Commit behavior (`data-htms-commit`)

Controls how the streamed result is applied to the placeholder. Default: `replace`.

| Value     | Effect                                              | DOM equivalent               |
| --------- | --------------------------------------------------- | ---------------------------- |
| `replace` | Replace the **placeholder node** (outer)            | `host.replaceWith(frag)`     |
| `content` | Replace the **children** of the placeholder (inner) | `host.replaceChildren(frag)` |
| `append`  | Append result **as last child**                     | `host.append(frag)`          |
| `prepend` | Insert result **as first child**                    | `host.prepend(frag)`         |
| `before`  | Insert result **before** the placeholder            | `host.before(frag)`          |
| `after`   | Insert result **after** the placeholder             | `host.after(frag)`           |

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

- With `append`, `prepend`, `before`, `after`, the placeholder stays in the DOM. Remove or restyle it if needed once the chunk is committed.
- With `content`, you keep the container (useful for accessibility/live regions).

### Accessibility (content mode)

When `data-htms-commit="content"` is used, HTMS automatically marks the placeholder as a **polite live region** while it is pending:

- Adds `role="status"` and `aria-busy="true"` on the host before the first update.
- On commit, flips `aria-busy` to `false` so screen readers announce the final content once.

This gives you accessible announcements out of the box, without extra markup. If you need a different behavior, switch to another commit mode or set your own ARIA attributes on the host.

---

## Usage

```ts
import Fastify from 'fastify';
import fastifyHtms from 'fastify-htms';

const app = Fastify();

app.register(fastifyHtms, {
  root: './public',
  index: 'index.html',
  match: '**/*.html',
});

app.listen({ port: 3000 });
```

This will:

- Look for `.html` files under the given `root`
- Stream them through the HTMS pipeline
- Serve `index.html` when the path is a directory
- Return 404 if no match is found

To also serve static assets (images, css, js), register [`@fastify/static`](https://github.com/fastify/fastify-static) alongside this plugin.

---

## Options

| Option           | Type                             | Default                     | Description                                                 |
| ---------------- | -------------------------------- | --------------------------- | ----------------------------------------------------------- |
| `root`           | `string`                         |                             | Required. Folder that contains your `.html` files           |
| `index`          | `string`                         | `'index.html'`              | Default file to serve when a directory is requested         |
| `match`          | `string`                         | `'**/*.htm?(l)'`            | Minimatch pattern to filter which files are handled by HTMS |
| `environment`    | `'development' \| 'production'`  | `'development'`             | Set the environment                                         |
| `compression`    | `boolean`                        | `true`                      | Enable response compression                                 |
| `encodings`      | `HtmsCompressorEncoding`         | `['br', 'gzip', 'deflate']` | Enable response compression                                 |
| `cacheModule`    | `boolean`                        | `true`                      | Enable module caching                                       |
| `createResolver` | `(filePath: string) => Resolver` | `undefined`                 | Custom resolver factory for HTMS                            |

---

## More info

For details on how HTMS works and how to write resolvers, see [htms-js](https://github.com/skarab42/htms-js/tree/main/packages/htms-js).

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
