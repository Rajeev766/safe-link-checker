---
layout: home

hero:
  name: "safe-link-checker"
  text: "URL Intelligence SDK"
  tagline: "One package. Every platform. Zero config. Detect phishing, malware, and unsafe links in real-time."
  actions:
    - theme: brand
      text: Get Started →
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/Rajeev766/safe-link-checker
    - theme: alt
      text: Try Playground
      link: /playground

features:
  - icon: 🔍
    title: Deep URL Analysis
    details: Heuristic engine detects phishing, homograph attacks, brand impersonation, suspicious keywords, and high-entropy domains — all offline, no API key required.

  - icon: 🌐
    title: Every Runtime, One Import
    details: Automatically detects Node.js, Browser, React Native, Expo, Cloudflare Workers, Vercel Edge, Bun, and Deno. No platform-specific imports, ever.

  - icon: 🛡️
    title: Production Security
    details: SSRF protection, DNS rebinding prevention, TLS certificate validation, redirect loop detection, and protocol downgrade blocking — all built-in.

  - icon: ⚡
    title: Blazing Fast
    details: Sub-100ms for single URLs. Bounded concurrency scheduler processes 1,000 URLs in parallel. Intelligent LRU cache with TTL eliminates redundant checks.

  - icon: 🔌
    title: Extensible Plugin System
    details: Build custom plugins and threat intelligence providers. Ships with URLHaus and OpenPhish integrations out of the box.

  - icon: 🎛️
    title: Policy Engine
    details: 10 built-in policies (strict, balanced, messaging, financial, healthcare, parental, enterprise, government, developer, social) or write your own declarative rules.

  - icon: ☁️
    title: Optional Cloud Mode
    details: Connect to Safe Link Cloud for real-time threat feeds, shared intelligence, and enterprise-grade dashboards — completely optional.

  - icon: 📊
    title: Rich Evidence
    details: Every result includes a trust score, risk score, confidence, classification, decision, evidence trail, redirect chain, and actionable recommendations.
---

## Quick Install

::: code-group

```bash [npm]
npm install safe-link-checker
```

```bash [yarn]
yarn add safe-link-checker
```

```bash [pnpm]
pnpm add safe-link-checker
```

```bash [bun]
bun add safe-link-checker
```

:::

## Quick Example

```typescript
import { verifyLink } from 'safe-link-checker';

const result = await verifyLink('https://paypal-secure-login.xyz');

console.log(result.trustScore);      // 8
console.log(result.decision);        // 'BLOCK'
console.log(result.classification);  // 'Phishing'
console.log(result.summary);
// → 'URL exhibits multiple high-risk phishing indicators...'
```

Works identically in **Node.js**, **React Native**, **Expo**, **Browser**, **Cloudflare Workers**, **Vercel Edge**, **Bun**, and **Deno** — no configuration needed.

<div class="tip custom-block" style="padding-top: 8px">

🚀 **5-minute quick start** → [Get Started](/guide/quick-start)

</div>
