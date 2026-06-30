# Safe Link Checker Ecosystem

A next-generation, enterprise-grade URL intelligence platform designed to be a highly modular, extensible, and production-ready safety checker for links and URLs.

This monorepo contains the core SDK and the Cloud Verification API, providing both local embedded verification and scalable cloud-based URL analysis.

## Repository Structure

- **`packages/safe-link-checker`**: The core SDK. A zero-dependency (mostly), highly extensible Node.js library for validating and scoring URLs based on heuristics, redirect tracing, SSL validation, and threat intelligence providers.
- **`apps/api`**: A scalable cloud verification API built with Express and Prisma, offering a RESTful interface to the core SDK's capabilities.

## Features

- **Extensive Validations**: Checks for valid URLs, private/local IPs (SSRF protection), Punycode homograph attacks, HTTPS/SSL validity, and URL shorteners.
- **Redirect Tracing**: Follows redirect chains and detects redirect loops and protocol downgrades.
- **Modular Scoring Engine**: Uses a weighted penalty system to calculate a final score (0-100) and risk level (`SAFE`, `SUSPICIOUS`, `DANGEROUS`). Generates detailed reasons and actionable recommendations.
- **Plugin Architecture**: Easily integrate external threat intelligence providers (e.g., URLHaus, OpenPhish).
- **LRU Cache**: Built-in memory cache with TTL and max size limits.
- **CLI Tool**: Usable directly from the terminal with colored or JSON output.
- **Cloud API**: A robust REST API for verifying links at scale, with rate limiting and database storage.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

Install dependencies from the root directory to bootstrap the monorepo:

```bash
npm install
```

### Building the Project

Build all packages and apps:

```bash
npm run build --workspaces
```

### Running the API

Start the API server in development mode:

```bash
npm run dev --workspace=api
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute to this project.

## License

MIT
