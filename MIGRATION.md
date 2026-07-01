# Safe Link Checker - Migration Guide (v1 to v2)

The `safe-link-checker` project has been refactored into a monorepo containing a suite of platform-specific packages. This allows usage in any JavaScript runtime (Browser, Node.js, React Native, Expo, Bun, Deno, Cloudflare Workers).

## Why the Change?

Previously, `safe-link-checker` was heavily tied to Node.js built-ins (`http`, `dns`, `tls`, `net`), making it incompatible with modern frontend environments and Edge networks. We have now decoupled the core engine from platform-specific APIs.

## New Packages Ecosystem

- **`safe-link-checker-types`**: Core interfaces and types.
- **`safe-link-checker-core`**: The universal engine, cache, generic validators, and plugin orchestrator. Zero dependencies.
- **`safe-link-checker-browser`**: Built on `core`. Safe for all non-Node runtimes (React Native, Expo, Browsers).
- **`safe-link-checker-node`**: Extends `browser` with Node-specific plugins (HTTPS certificate validation, advanced redirects, DNS lookup).
- **`safe-link-checker` (Legacy Proxy)**: For backwards compatibility, it now acts as a proxy to `safe-link-checker-node`.
- **`safe-link-checker-api`**: A ready-to-deploy Express.js REST API server.
- **`safe-link-checker-cli`**: The CLI utility for checking links from your terminal.

---

## Migration Steps for Node.js Users

If you are running in a Node.js environment, **no breaking changes** have been made to the public API.

1. **Option A (Seamless Update)**: 
   Update your dependency of `safe-link-checker` to the latest version. It automatically resolves to `safe-link-checker-node` under the hood.
   ```bash
   npm install safe-link-checker@latest
   ```

2. **Option B (Direct Import)**:
   For better clarity, switch to the dedicated Node package:
   ```bash
   npm install safe-link-checker-node
   ```
   ```diff
   - import { verifyLink } from 'safe-link-checker';
   + import { verifyLink } from 'safe-link-checker-node';
   ```

---

## Migration Steps for Browser / React Native / Expo Users

If you are using `safe-link-checker` in the browser or mobile, you must use the `browser` package to avoid Node.js polyfill errors.

1. **Install the Browser Package**:
   ```bash
   npm install safe-link-checker-browser
   ```

2. **Update your imports**:
   ```typescript
   import { verifyLink } from 'safe-link-checker-browser';
   
   // Same exact API, but safely executes without Node.js modules
   const result = await verifyLink('https://example.com');
   ```

**Note**: In the browser, Node-specific checks (e.g. DNS resolution, deep TLS validation) are safely disabled or bypassed. The check runs locally against providers (URLHaus, OpenPhish) in `<20ms`!

---

## API & CLI Usage

**CLI Tool:**
The CLI has been moved to a dedicated package.
```bash
npx safe-link-checker-cli https://example.com --json
```

**REST API:**
We now provide a pre-built API.
```bash
npx safe-link-checker-api
# Server runs on port 3000
```
