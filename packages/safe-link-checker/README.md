# safe-link-checker

A production-ready, modular, and highly extensible safety checker for links and URLs.

[![CI](https://github.com/your-username/safe-link-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/safe-link-checker/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/safe-link-checker.svg)](https://npmjs.org/package/safe-link-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Extensive Validations**: Checks for valid URLs, private/local IPs (SSRF protection), Punycode homograph attacks, HTTPS/SSL validity, and URL shorteners.
- **Redirect Tracing**: Follows redirect chains and detects redirect loops and protocol downgrades.
- **Modular Scoring Engine**: Uses a weighted penalty system to calculate a final score (0-100) and risk level (`SAFE`, `SUSPICIOUS`, `DANGEROUS`). Generates detailed reasons and actionable recommendations.
- **Plugin Architecture**: Easily integrate external threat intelligence providers.
- **LRU Cache**: Built-in memory cache with TTL and max size limits.
- **CLI Tool**: Usable directly from the terminal with colored or JSON output.
- **TypeScript Support**: First-class TS support with bundled declarations.

## Installation

```bash
npm install safe-link-checker
# or
yarn add safe-link-checker
# or
pnpm add safe-link-checker
```

## Basic Usage

```typescript
import { verifyLink } from 'safe-link-checker';

const result = await verifyLink('https://example.com');

console.log(result.safe); // true or false
console.log(result.score); // safety score (0 - 100)
console.log(result.riskLevel); // 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS'
console.log(result.redirectChain); // list of followed redirect hops
```

## Scripts

- `npm run dev`: Build and watch src/index.ts.
- `npm run build`: Compile CJS, ESM, and DTS bundles using `tsup`.
- `npm run test`: Run the unit test suite using `jest` and `ts-jest`.
- `npm run lint`: Check code quality with `eslint`.
- `npm run format`: Standardize code styling with `prettier`.

## License

MIT
