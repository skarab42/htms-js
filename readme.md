# htms 💨 Stream Async HTML, Stay SEO-Friendly

[![npm htms-dom](https://img.shields.io/npm/v/htms-dom.svg?label=htms-js&color=blue)](https://www.npmjs.com/package/htms-dom)
[![npm htms-js](https://img.shields.io/npm/v/htms-js.svg?label=htms-js&color=blue)](https://www.npmjs.com/package/htms-js)
[![npm fastify-htms](https://img.shields.io/npm/v/fastify-htms.svg?label=fastify-htms&color=blue)](https://www.npmjs.com/package/fastify-htms)
[![npm fastify-htms](https://img.shields.io/npm/v/htms-server.svg?label=htms-server&color=blue)](https://www.npmjs.com/package/htms-server)
[![build status](https://img.shields.io/github/actions/workflow/status/skarab42/htms-js/ci.yml?branch=main&label=ci)](https://github.com/skarab42/htms-js/actions)
[![codecov](https://codecov.io/github/skarab42/htms-js/branch/main/graph/badge.svg)](https://codecov.io/github/skarab42/htms-js)
[![license](https://img.shields.io/github/license/skarab42/htms-js)](./license.md)
[![stars](https://img.shields.io/github/stars/skarab42/htms-js?style=social)](https://github.com/skarab42/htms-js/stargazers)

> Send HTML that **renders instantly**, then **fills itself in** as async tasks complete. One response. No hydration. No empty shells.

This monorepo hosts the JavaScript implementation of **HTMS**: a proposal to progressively render HTML with async functions while staying SEO-friendly and lightweight.

---

## Packages

This workspace contains multiple packages:

- [**htms-js**](./packages/htms-js) – Core library to tokenize, resolve, and stream HTML.
- [**htms-dom**](./packages/htms-dom) – Core browser library to swap and clean placeholders.
- [**fastify-htms**](./packages/fastify-htms) – Fastify plugin that wires `htms-js` into Fastify routes.
- [**htms-server**](./packages/htms-server) – CLI to quickly spin up a server and test streaming HTML.

Each package has its own README with installation and usage instructions.

> 🦀 Rustacean? Check out [**htms-rs**](https://github.com/skarab42/htms-rs).

---

## Why try it

- **Instant rendering:** browsers show HTML immediately.
- **Progressive async:** placeholders stream in as soon as ready.
- **Scoped modules:** keep tasks organized by context, even with nested `data-htms-module` blocks.
- **SEO intact:** bots see full HTML.
- **Tiny runtime:** one Web Component, injected automatically.
- **Tech-agnostic:** works with Express, Fastify, Hono, workers, or even raw `stdout`.

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

## Status

This is **experimental**. APIs may change.

We'd love developers to:

- **Experiment** in different contexts.
- **Find limits:** performance, DX, compatibility.
- **Challenge assumptions** and suggest alternatives.
- **See if it fits your framework or stack.**

---

## Development

Setup

```bash
git clone https://github.com/skarab42/htms-js.git
cd htms-js
pnpm i
pnpm build
```

Common dev commands

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

# code coverage
pnpm coverage

# build all packages
pnpm build
```

Run examples

```bash
# run from repo root, pick one:
pnpm --filter server-example start # published dashboard demo at https://htms.skarab42.dev
pnpm --filter hono-example start
pnpm --filter fastify-example start
pnpm --filter express-example start
pnpm --filter stdout-example start
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
