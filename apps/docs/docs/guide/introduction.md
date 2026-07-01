# Introduction

**safe-link-checker** is a production-grade URL Intelligence SDK for the JavaScript ecosystem. It gives every application — from mobile apps to backend APIs — the ability to detect unsafe, malicious, or suspicious links with a single function call.

## What It Does

When you call `verifyLink('https://some-url.com')`, the SDK:

1. **Normalizes** the URL (handles encoding, trailing slashes, protocol normalization)
2. **Runs heuristic analysis** — entropy scoring, keyword detection, homograph/Punycode detection, TLD analysis, brand impersonation detection
3. **Follows redirect chains** — detects loops, protocol downgrades, and max-redirect violations
4. **Validates TLS** (Node.js only) — checks certificate validity, chain trust, and expiry
5. **Queries threat providers** — URLHaus, OpenPhish, or your custom feeds
6. **Applies your policy** — determines a final `ALLOW`, `WARN`, `REVIEW`, `BLOCK`, or `ESCALATE` decision
7. **Returns rich evidence** — trust score, risk score, classification, evidence trail, recommendations

## Design Philosophy

### Single Package, Every Runtime

```bash
npm install safe-link-checker
```

The same `import { verifyLink } from 'safe-link-checker'` works in Node.js, the browser, React Native, Expo, Cloudflare Workers, Vercel Edge Functions, Bun, and Deno. Runtime detection is automatic.

### Zero Configuration to Start

```typescript
const result = await verifyLink('https://example.com');
console.log(result.safe); // true
```

No API key, no account, no configuration file. Works offline with the built-in heuristic engine.

### Additive Complexity

Simple when you need simple. Powerful when you need powerful:

```typescript
// Simple
const result = await verifyLink(url);

// Advanced
const checker = new SafeLinkChecker({
  policy: 'strict',
  providers: ['openphish', 'urlhaus'],
  cache: true,
  hooks: {
    onBlocked: (url, reasons) => analytics.track('link_blocked', { url, reasons })
  }
});
```

### Explain Everything

Every decision is explainable. The `evidence` array contains every signal that contributed to the final score:

```typescript
result.evidence.forEach(e => {
  console.log(`${e.name}: ${e.safe ? '✅' : '⚠️'} (severity: ${e.severity})`);
});
```

## When To Use It

| Use Case | Example |
|---|---|
| **Chat / messaging apps** | Scan URLs before showing a preview |
| **Content moderation** | Flag user-submitted links for review |
| **Backend API protection** | Block webhook URLs targeting private IPs (SSRF) |
| **Mobile deep links** | Validate URLs before `Linking.openURL()` |
| **Browser extensions** | Warn users about suspicious links |
| **Email processing** | Scan links in incoming emails |
| **Form validation** | Validate URLs in user-facing forms |
| **CI/CD pipelines** | Check URLs in configuration files |

## Ecosystem

| Package | Purpose |
|---|---|
| `safe-link-checker` | Main SDK — use this |
| `@safe-link-checker/core` | Core engine (internal) |
| `@safe-link-checker/node-runtime` | Node.js runtime implementation |
| `@safe-link-checker/browser-runtime` | Browser/RN runtime implementation |
| `@safe-link-checker/edge-runtime` | Edge runtime implementation |
| `@safe-link-checker/plugins` | Built-in plugin collection |
| `@safe-link-checker/providers` | URLHaus, OpenPhish providers |

::: tip Next Step
[Install the SDK →](/guide/installation)
:::
