# Changelog

## [0.6.0](https://github.com/skarab42/htms-js/compare/fastify-htms@v0.5.0...fastify-htms@v0.6.0) (2025-09-18)


### ⚠ BREAKING CHANGES

* replace `data-htms-params` with `data-htms-value` ([#42](https://github.com/skarab42/htms-js/issues/42))

### 🛠 Refactors

* replace `data-htms-params` with `data-htms-value` ([#42](https://github.com/skarab42/htms-js/issues/42)) ([381ef19](https://github.com/skarab42/htms-js/commit/381ef19138c4e23c31411920efc6c6e450c64b6c))

## [0.5.0](https://github.com/skarab42/htms-js/compare/fastify-htms@v0.4.0...fastify-htms@v0.5.0) (2025-09-17)


### ✨ Features

* add `data-htms-commit` attribute ([#33](https://github.com/skarab42/htms-js/issues/33)) ([af9bed8](https://github.com/skarab42/htms-js/commit/af9bed86bb778d2e4db434a78cb70bfc52c6420c))

## [0.4.0](https://github.com/skarab42/htms-js/compare/fastify-htms@v0.3.0...fastify-htms@v0.4.0) (2025-09-17)


### ✨ Features

* task parameters `[data-htms-params]` ([#27](https://github.com/skarab42/htms-js/issues/27)) ([75f6e80](https://github.com/skarab42/htms-js/commit/75f6e803a36f19fe2eb22aeb4e881b1aadd2e4da))


### 🧹 Chores

* update dependencies ([#29](https://github.com/skarab42/htms-js/issues/29)) ([a1e8c16](https://github.com/skarab42/htms-js/commit/a1e8c16074050ee7ebb9d6f8ae4d0e58209a3d9a))

## [0.3.0](https://github.com/skarab42/htms-js/compare/fastify-htms@v0.2.0...fastify-htms@v0.3.0) (2025-09-16)


### ✨ Features

* scoped modules ([#13](https://github.com/skarab42/htms-js/issues/13)) ([2f5f742](https://github.com/skarab42/htms-js/commit/2f5f742f205c50b580d0d51debfe217ba445b1db))


### 🐛 Bug Fixes

* set `fastify` as `peerDependencies` ([#18](https://github.com/skarab42/htms-js/issues/18)) ([ed24145](https://github.com/skarab42/htms-js/commit/ed24145ebf45d5870bcd3357021ac6512a1e1fbf))


### ⚙️ CI

* code coverage ([#19](https://github.com/skarab42/htms-js/issues/19)) ([8a18a4f](https://github.com/skarab42/htms-js/commit/8a18a4f215b9977ef5532ff7b507b0bd0076c0c3))
* code quality workflow ([#14](https://github.com/skarab42/htms-js/issues/14)) ([709d70f](https://github.com/skarab42/htms-js/commit/709d70fd9a672c13bce4acf78f40a4e215783569))


### 🧹 Chores

* add `packageManager` and `engines` fields ([#17](https://github.com/skarab42/htms-js/issues/17)) ([268f5c1](https://github.com/skarab42/htms-js/commit/268f5c1d42c59e8edc39e7d3253fb229aa9642fc))

## [0.2.0](https://github.com/skarab42/htms-js/compare/fastify-htms@v0.1.0...fastify-htms@v0.2.0) (2025-09-10)


### ✨ Features

* zlib compression ([#9](https://github.com/skarab42/htms-js/issues/9)) ([19abc1f](https://github.com/skarab42/htms-js/commit/19abc1fcd6d39f8049cb1dc682061cd9650927fe))


### 📝 Docs

* add live demo link ([1a2ff57](https://github.com/skarab42/htms-js/commit/1a2ff576cc92960401233bb07789cde90ae7c397))
* fix repo links ([9d9709a](https://github.com/skarab42/htms-js/commit/9d9709aab1099f17bb9db2cbaed439bd0c3839c3))


### 🧹 Chores

* add `license.md` to each packages ([ba24756](https://github.com/skarab42/htms-js/commit/ba247567a8d0d3e611efa5dcb4226c8940b55b58))
* move `changelog.md` to package root ([bdede5d](https://github.com/skarab42/htms-js/commit/bdede5dc96a55656be6efc03218e91ecdc732308))

## 0.1.0 (2025-09-09)


### ✨ Features

* `fastify-htms` plugin ([0dc8fbd](https://github.com/skarab42/htms-js/commit/0dc8fbd9dd6e93e37a62afe0942e7578758989fe))
* add `cacheModule` option ([95a288b](https://github.com/skarab42/htms-js/commit/95a288bc17b6604c6646482a09b89cb3e0ee2b10))
* add `environment` option ([35b0cb6](https://github.com/skarab42/htms-js/commit/35b0cb6d9a63aad275004fea8107caf2e3337a85))
* pass `basePath` option to create resolver callback ([f8de7ea](https://github.com/skarab42/htms-js/commit/f8de7eaeaf920eac25194b2a6c3c53a14d4d3faa))


### 📝 Docs

* more readme ([964cce1](https://github.com/skarab42/htms-js/commit/964cce137f9d19da3284730f7ec1e27a0fb1ae45))


### 🛠 Refactors

* extract `getMatchingFilePath` for better testing ([edea777](https://github.com/skarab42/htms-js/commit/edea777c2345f1a15aa0f61faf378f3e1ac54afb))


### 🎨 Style

* nodenext imports ([262c60e](https://github.com/skarab42/htms-js/commit/262c60e4996d22d0964e150963239f3a96a1bea9))


### 🧪 Tests

* `fastifyHtms` plugin ([28fca07](https://github.com/skarab42/htms-js/commit/28fca0764b6b7aecba085227517487c41b89b0f8))
* `getMatchingFilePath` ([beb2c75](https://github.com/skarab42/htms-js/commit/beb2c7551d371f476745d22e3c7d85ebdccfe0a9))
* with environement production ([bc55f73](https://github.com/skarab42/htms-js/commit/bc55f730876b56f4c6c252bbebbde0476ed27189))


### 🧹 Chores

* bootstrap `release-please` ([#1](https://github.com/skarab42/htms-js/issues/1)) ([0622417](https://github.com/skarab42/htms-js/commit/0622417e6697d33aa88abe39c1431a68a9b6c59e))
* clean tsconfig ([9d51f1e](https://github.com/skarab42/htms-js/commit/9d51f1eae40b3c319b1948d392b81f1d070cbe7d))
* version + publishConfig ([d7208c6](https://github.com/skarab42/htms-js/commit/d7208c6af78ef7ab49c4ba107f0a50cacf5bc6be))
