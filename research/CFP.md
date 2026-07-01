# Conference Call for Papers (CFP) Proposals

## Talk 1: React Conf
**Title**: Stop Validating URLs. Start Analyzing Them.
**Abstract**:
Every React developer has written a form with a URL input. Most of us use a simple Regex or `validator.js`. But what happens when a user submits `https://paypal-secure.com`? It passes validation, but it's a phishing site. In this talk, we'll explore why client-side URL intelligence is the new standard, and how to build a real-time reputation engine directly into your React components without bloating your bundle size.

## Talk 2: NodeConf
**Title**: Building a Universal Security SDK for the JavaScript Multiverse
**Abstract**:
Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge... the JavaScript runtime ecosystem has exploded. How do you build a security SDK that leverages Node's `tls` module when available, but gracefully falls back to `fetch` on the Edge, all without requiring developers to change their import paths? We'll dive into the architecture of `safe-link-checker` and discuss how to inject capabilities at runtime.

## Talk 3: DEF CON / Black Hat Arsenal
**Title**: Democratizing URL Threat Intelligence
**Abstract**:
Enterprise URL filtering costs thousands of dollars. We built an open-source, universal URL intelligence engine that runs entirely in the client or at the edge. We'll demonstrate how the heuristic engine detects homograph attacks and brand impersonation purely mathematically, bypassing the need for expensive API calls.
