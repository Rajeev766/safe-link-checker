# 🌐 Supported Runtimes

`safe-link-checker` is universally compatible across JavaScript runtimes. The package automatically detects your runtime and loads the optimized implementation.

| Runtime | Detection | Capabilities |
|---|---|---|
| **Node.js (18+)** | `process.versions.node` | Full — DNS, TLS, redirect tracing, threat feeds |
| **Bun** | `globalThis.Bun` | Full — same as Node.js via Bun compatibility |
| **Deno** | `globalThis.Deno` | Full — same as Node.js via Deno compatibility |
| **Browser** | `typeof window` | Heuristics, homograph, providers via `fetch` |
| **React Native** | `navigator.product` | Heuristics, homograph, providers via `fetch` |
| **Expo** | RN detection | Same as React Native |
| **Cloudflare Workers** | Edge runtime | Heuristics + `fetch`-based providers |
| **Vercel Edge** | Edge runtime | Same as Cloudflare Workers |
| **Next.js Server** | Node.js | Full Node.js capabilities |
| **Electron** | `process.versions.electron` | Full Node.js capabilities |
