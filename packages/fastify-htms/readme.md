# fastify-htms

Fastify plugin that integrates [htms-js](https://github.com/skarab42/htms-js) with Fastify.

---

## Try the live demo

- https://htms.skarab42.dev

---

## Install

Use your preferred package manager to install the plugin:

```bash
pnpm add htms-js
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

| Option           | Type                             | Description                                                 |
| ---------------- | -------------------------------- | ----------------------------------------------------------- |
| `root`           | `string`                         | Required. Folder that contains your `.html` files           |
| `index`          | `string`                         | Default file to serve when a directory is requested         |
| `match`          | `string`                         | Minimatch pattern to filter which files are handled by HTMS |
| `createResolver` | `(filePath: string) => Resolver` | Custom resolver factory for HTMS                            |
| `environment`    | `'development' \| 'production'`  | Set the environment                                         |
| `cacheModule`    | `boolean`                        | Enable module caching                                       |

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
