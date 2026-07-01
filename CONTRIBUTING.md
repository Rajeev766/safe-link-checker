# Contributing to safe-link-checker

First off, thank you for considering contributing to `safe-link-checker`! It's people like you that make it such a great tool.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rajeev766/safe-link-checker.git
   cd safe-link-checker
   ```

2. **Install dependencies**
   This project uses `npm` workspaces.
   ```bash
   npm install
   ```

3. **Build the packages**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Architecture

The project is structured as a monorepo:
- `packages/core`: The core engine, types, and base plugins.
- `packages/node-runtime`: Node.js specific implementations (DNS, full TLS).
- `packages/browser-runtime`: Lightweight fetch-based implementation.
- `packages/safe-link-checker`: The universal entry point that routes to the correct runtime.

## Submitting a Pull Request

1. Create a new branch: `git checkout -b my-feature-branch`
2. Make your changes and commit them following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
3. Push to your fork and submit a pull request.
4. Ensure all CI checks pass (lint, test, build).

Thank you for contributing!
