# htms workspace 💨 Stream Async HTML, Stay SEO-Friendly

> Send HTML that **renders instantly**, then **fills itself in** as async tasks complete. One response. No hydration. No empty shells.

This monorepo hosts the JavaScript implementation of **HTMS**: a proposal to progressively render HTML with async functions while staying SEO-friendly and lightweight.

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
