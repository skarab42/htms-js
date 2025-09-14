# htms 💨 Stream Async HTML, Stay SEO-Friendly

[![npm htms-js](https://img.shields.io/npm/v/htms-js.svg?label=htms-js&color=blue)](./packages/htms-js)
[![npm fastify-htms](https://img.shields.io/npm/v/fastify-htms.svg?label=fastify-htms&color=blue)](./packages/fastify-htms)
[![npm fastify-htms](https://img.shields.io/npm/v/htms-server.svg?label=htms-server&color=blue)](./packages/htms-server)
[![build status](https://img.shields.io/github/actions/workflow/status/skarab42/htms-js/ci.yml?branch=main&label=ci)](https://github.com/skarab42/htms-js/actions)
[![codecov](https://codecov.io/github/skarab42/htms-js/branch/main/graph/badge.svg)](https://codecov.io/github/skarab42/htms-js)
[![license](https://img.shields.io/github/license/skarab42/htms-js)](./license.md)
[![stars](https://img.shields.io/github/stars/skarab42/htms-js?style=social)](https://github.com/skarab42/htms-js/stargazers)

> Send HTML that **renders instantly**, then **fills itself in** as async tasks complete. One response. No hydration. No empty shells.

This monorepo hosts the JavaScript implementation of **HTMS**: a proposal to progressively render HTML with async functions while staying SEO-friendly and lightweight.

---

## Try the live demo

- https://htms.skarab42.dev

---

## Packages

This workspace contains multiple packages:

- [**htms-js**](./packages/htms-js) – Core library to tokenize, resolve, and stream HTML.
- [**fastify-htms**](./packages/fastify-htms) – Fastify plugin that wires `htms-js` into Fastify routes.
- [**htms-server**](./packages/htms-server) – CLI to quickly spin up a server and test streaming HTML.

Each package has its own README with installation and usage instructions.

> 🦀 Rustacean? Check out [**htms-rs**](https://github.com/skarab42/htms-rs).

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
