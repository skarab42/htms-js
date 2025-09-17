# htms-server

[![npm version](https://img.shields.io/npm/v/htms-server.svg?color=blue)](https://www.npmjs.com/package/htms-server)
[![build status](https://img.shields.io/github/actions/workflow/status/skarab42/htms-js/ci.yml?branch=main&label=ci)](https://github.com/skarab42/htms-js/actions)
[![codecov](https://codecov.io/github/skarab42/htms-js/branch/main/graph/badge.svg?flag=htms-server)](https://codecov.io/github/skarab42/htms-js)
[![install size](https://packagephobia.com/badge?p=htms-server)](https://packagephobia.com/result?p=htms-server)
[![license](https://img.shields.io/github/license/skarab42/htms-js)](./license.md)
[![stars](https://img.shields.io/github/stars/skarab42/htms-js?style=social)](https://github.com/skarab42/htms-js/stargazers)

Small CLI to quickly test HTML streaming with [htms-js](https://github.com/skarab42/htms-js) without writing code.

---

## Try the live demo

- https://htms.skarab42.dev

---

## Install (global)

Use your preferred package manager to install the CLI globally:

```bash
pnpm add -g htms-server
# or
npm i -g htms-server
# or
yarn global add htms-server
# or
bun add -g htms-server
```

This will expose the `htms-server` command.

## Without global installation

You can also run it directly without installing it globally:

```bash
npx htms-server start
# or
pnpm dlx htms-server start
# or
yarn dlx htms-server start
# or
bunx htms-server start
```

This will run the `htms-server` `start` command.

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

Start server

```bash
htms-server start [options]
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

```bash
htms-server start [options]
```

Starts a local server that serves `.html` files and streams them through the HTMS pipeline.

### Options

| Flag                  | Description                   | Default                                           |
| --------------------- | ----------------------------- | ------------------------------------------------- |
| `--host <host>`       | Host to bind                  | `localhost`                                       |
| `--port <port>`       | Port to listen on             | `4200`                                            |
| `--root <path>`       | Root directory to serve       | `./public`                                        |
| `--environment <env>` | `production` or `development` | `production`                                      |
| `--compression`       | Enable response compression   | `true`                                            |
| `--cache-module`      | Enable module caching         | `false` (`true` if `undefined` and `development`) |
| `--logger`            | Enable logging                | `false` (`true` if `undefined` and `development`) |

### Examples

Serve the `./public` folder with defaults:

```bash
htms-server start
```

Custom port and root:

```bash
htms-server start --root ./examples --port 8080 --logger --environment development
```

Open the shown URL in your browser to see HTML streaming in action.

---

## Notes

- This CLI is for quick local testing. For integration in a Fastify app, use [fastify-htms](https://github.com/skarab42/htms-js/tree/main/packages/fastify-htms/).
- For how HTMS works (resolvers, placeholders, etc.), see [htms-js](https://github.com/skarab42/htms-js).

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
