# htms-server

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
