<p align="center">
  <h1 align="center">🔗 safe-link-checker</h1>
  <p align="center">The URL Intelligence SDK for every JavaScript runtime</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/safe-link-checker"><img src="https://img.shields.io/npm/v/safe-link-checker?style=flat-square&color=0070f3&label=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/safe-link-checker"><img src="https://img.shields.io/npm/dm/safe-link-checker?style=flat-square&color=0070f3" alt="downloads" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/safe-link-checker?style=flat-square&color=green" alt="license" /></a>
  <a href="https://bundlephobia.com/package/safe-link-checker"><img src="https://img.shields.io/bundlephobia/minzip/safe-link-checker?style=flat-square&label=gzip%20size&color=orange" alt="bundle size" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript" alt="typescript" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker/actions"><img src="https://img.shields.io/github/actions/workflow/status/Rajeev766/safe-link-checker/ci.yml?style=flat-square&label=CI" alt="CI" /></a>
  <a href="https://codecov.io/gh/Rajeev766/safe-link-checker"><img src="https://img.shields.io/codecov/c/github/Rajeev766/safe-link-checker?style=flat-square&label=coverage" alt="coverage" /></a>
  <a href="https://securityscorecards.dev/viewer/?uri=github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/ossf-scorecard/github.com/Rajeev766/safe-link-checker?label=openssf%20scorecard&style=flat-square" alt="OpenSSF Scorecard" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker/security"><img src="https://img.shields.io/badge/security-audited-success?style=flat-square" alt="Security" /></a>
</p>

<p align="center">
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js" alt="node" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/React_Native-supported-61DAFB?style=flat-square&logo=react" alt="react native" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/Expo-supported-000020?style=flat-square&logo=expo" alt="expo" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/Edge_Runtime-supported-f38020?style=flat-square&logo=cloudflare" alt="edge" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/Bun-supported-fbf0df?style=flat-square&logo=bun" alt="bun" /></a>
  <a href="https://github.com/Rajeev766/safe-link-checker"><img src="https://img.shields.io/badge/Deno-supported-000000?style=flat-square&logo=deno" alt="deno" /></a>
</p>

<p align="center">
  <strong>One package. Every platform. Zero config.</strong><br/>
  Real-time URL threat intelligence with heuristics, redirect tracing, TLS validation, and threat feeds.
</p>

---

## ✨ Why safe-link-checker?

| Feature | safe-link-checker | validator.js | is-url | regex |
|---|:---:|:---:|:---:|:---:|
| Trust scoring (0–100) | ✅ | ❌ | ❌ | ❌ |
| Phishing detection | ✅ | ❌ | ❌ | ❌ |
| Redirect tracing | ✅ | ❌ | ❌ | ❌ |
| TLS/cert validation | ✅ | ❌ | ❌ | ❌ |
| Homograph / Punycode | ✅ | ❌ | ❌ | ❌ |
| Threat feed integration | ✅ | ❌ | ❌ | ❌ |
| SSRF protection | ✅ | ❌ | ❌ | ❌ |
| Works in browser | ✅ | ✅ | ✅ | ✅ |
| Works on Edge/Workers | ✅ | ⚠️ | ⚠️ | ✅ |
| Works in React Native | ✅ | ⚠️ | ✅ | ✅ |
| Batch verification | ✅ | ❌ | ❌ | ❌ |
| Policy enforcement | ✅ | ❌ | ❌ | ❌ |
| TypeScript-first | ✅ | ✅ | ⚠️ | ❌ |

---

## 🚀 Quick Start

```bash
npm install safe-link-checker
```

```typescript
import { verifyLink } from 'safe-link-checker';

const result = await verifyLink('https://suspicious-login.example.com');

console.log(result.trustScore);      // 12
console.log(result.decision);        // 'BLOCK'
console.log(result.classification);  // 'Phishing'
console.log(result.summary);         // 'URL exhibits multiple high-risk indicators...'
```

**That's it.** Works identically in Node.js, React Native, Expo, Browser, Edge, Bun, and Deno — no platform-specific imports.

---

## 📦 Installation

```bash
# npm
npm install safe-link-checker

# yarn
yarn add safe-link-checker

# pnpm
pnpm add safe-link-checker

# bun
bun add safe-link-checker
```

---

## 🌐 Runtime Support

The package **automatically detects** your runtime and loads the best implementation. No configuration required.

| Runtime | Detection | Capabilities |
|---|---|---|
| **Node.js** | `process.versions.node` | Full — DNS, TLS, redirect tracing, threat feeds |
| **Bun** | `globalThis.Bun` | Full — same as Node.js via Bun compatibility |
| **Deno** | `globalThis.Deno` | Full — same as Node.js via Deno compatibility |
| **Browser** | `typeof window` | Heuristics, homograph, providers via `fetch` |
| **React Native** | `navigator.product` | Heuristics, homograph, providers via `fetch` |
| **Expo** | RN detection | Same as React Native |
| **Cloudflare Workers** | Edge runtime | Heuristics + `fetch`-based providers |
| **Vercel Edge** | Edge runtime | Same as Cloudflare Workers |
| **Next.js Server** | Node.js | Full Node.js capabilities |
| **Electron** | `process.versions.electron` | Full Node.js capabilities |

---

## 💡 Examples

### Node.js / Bun / Deno

```typescript
import { SafeLinkChecker } from 'safe-link-checker';

const checker = new SafeLinkChecker({
  providers: ['openphish', 'urlhaus'],
  policy: 'strict',
  cache: true,
});

const result = await checker.verify('https://paypal-secure-login.xyz');

if (result.decision === 'BLOCK') {
  console.error('⛔ Blocked:', result.summary);
  console.error('Evidence:', result.evidence.map(e => e.name));
}
```

### React / Next.js

```tsx
import { useState } from 'react';
import { verifyLink } from 'safe-link-checker';

export function LinkChecker() {
  const [result, setResult] = useState(null);

  const check = async (url: string) => {
    const res = await verifyLink(url);
    setResult(res);
  };

  return (
    <div>
      <input onBlur={(e) => check(e.target.value)} />
      {result && (
        <span style={{ color: result.safe ? 'green' : 'red' }}>
          {result.trustScore}/100 — {result.classification}
        </span>
      )}
    </div>
  );
}
```

### React Native / Expo

```typescript
import { verifyLink } from 'safe-link-checker';
import { Linking } from 'react-native';

// Safe deep-link handler
export async function safeOpenUrl(url: string) {
  const result = await verifyLink(url);

  if (result.decision === 'BLOCK') {
    Alert.alert('⚠️ Unsafe Link', result.summary);
    return;
  }

  if (result.decision === 'WARN') {
    // Show confirmation dialog
  }

  await Linking.openURL(result.normalizedUrl);
}
```

### Express.js

```typescript
import express from 'express';
import { verifyLink } from 'safe-link-checker';

const app = express();
app.use(express.json());

app.post('/api/check', async (req, res) => {
  const { url } = req.body;
  const result = await verifyLink(url);
  res.json({
    safe: result.safe,
    trustScore: result.trustScore,
    decision: result.decision,
    summary: result.summary,
  });
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { SafeLinkChecker } from 'safe-link-checker';

const app = Fastify();
const checker = new SafeLinkChecker({ providers: ['openphish', 'urlhaus'] });

app.post('/check', async (request, reply) => {
  const { url } = request.body as { url: string };
  return checker.verify(url);
});
```

### Cloudflare Workers / Vercel Edge

```typescript
import { verifyLink } from 'safe-link-checker';

export default {
  async fetch(request: Request) {
    const { url } = await request.json();
    const result = await verifyLink(url);
    return Response.json(result);
  }
};
```

### Batch Verification (Messaging Apps)

```typescript
import { verifyLinks } from 'safe-link-checker';

// Verify all URLs extracted from a message in parallel
const message = 'Check out https://google.com and https://phishing-site.xyz';
const urls = extractUrls(message);

const results = await verifyLinks(urls, {}, /* concurrency= */ 5);

const blocked = results.filter(r => r.decision === 'BLOCK');
if (blocked.length > 0) {
  showWarning(`${blocked.length} unsafe link(s) detected`);
}
```

---

## 🏛 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    safe-link-checker                     │
│                    (Universal Entry)                     │
└──────────────┬────────────────┬───────────────┬─────────┘
               ↓                ↓               ↓
      ┌────────────┐   ┌────────────┐   ┌────────────────┐
      │   Node     │   │  Browser   │   │   Edge         │
      │  Runtime   │   │  Runtime   │   │   Runtime      │
      │            │   │            │   │                │
      │ DNS+TLS+   │   │ fetch +    │   │ fetch +        │
      │ Redirects  │   │ Heuristics │   │ Heuristics     │
      └─────┬──────┘   └─────┬──────┘   └───────┬────────┘
            └────────────────┴──────────────────┘
                              ↓
                    ┌─────────────────┐
                    │   Core Engine   │
                    │                 │
                    │  Plugin System  │
                    │  Rule Engine    │
                    │  Trust Engine   │
                    │  Policy Engine  │
                    └─────────────────┘
```

---

## 🎛 Policies

Apply pre-built security policies to match your use case:

```typescript
import { SafeLinkChecker } from 'safe-link-checker';

// Strict: blocks suspicious, warns on unknown
const checker = new SafeLinkChecker({ policy: 'strict' });

// Balanced: blocks known threats, warns on suspicious
const checker = new SafeLinkChecker({ policy: 'balanced' });

// Messaging: optimized for chat applications
const checker = new SafeLinkChecker({ policy: 'messaging' });

// Available policies:
// 'strict' | 'balanced' | 'enterprise' | 'parental'
// 'developer' | 'messaging' | 'social' | 'financial'
// 'healthcare' | 'government'
```

---

## 🔌 Plugins & Providers

```typescript
import { SafeLinkChecker } from 'safe-link-checker';
import { URLHausProvider, OpenPhishProvider } from 'safe-link-checker';

const checker = new SafeLinkChecker()
  .use(new URLHausProvider())
  .use(new OpenPhishProvider());

// Custom provider
checker.use({
  name: 'MyThreatFeed',
  async check(url) {
    const hit = await myAPI.lookup(url);
    return hit ? { safe: false, scoreImpact: 80, message: 'Listed in MyThreatFeed' } : null;
  }
});
```

---

## 📊 Verification Result

Every call returns a rich `VerificationResult` object:

```typescript
{
  url: 'https://paypal-secure-login.xyz',
  normalizedUrl: 'https://paypal-secure-login.xyz',
  safe: false,
  trustScore: 8,           // 0-100, higher = safer
  riskScore: 92,           // 0-100, lower = safer
  confidence: 95,          // how certain we are

  classification: 'Phishing',
  threatLevel: 'CRITICAL',
  riskLevel: 'DANGEROUS',
  decision: 'BLOCK',       // 'ALLOW' | 'WARN' | 'REVIEW' | 'BLOCK' | 'ESCALATE'

  summary: 'URL exhibits multiple high-risk phishing indicators...',
  recommendation: 'Do not visit this URL. Report it immediately.',

  evidence: [
    { name: 'BrandImpersonation', severity: 'high', safe: false },
    { name: 'SuspiciousKeyword',  severity: 'medium', safe: false },
    { name: 'HighEntropy',        severity: 'low', safe: false },
  ],

  redirectTrace: {
    chain: ['https://paypal-secure-login.xyz', 'https://steal-creds.ru'],
    redirectCount: 1,
    anomalies: ['PROTOCOL_DOWNGRADE'],
  },

  fromCache: false,
  runtime: 'node',
}
```

---

## 📈 Benchmarks

Measured on Node.js 20, M2 MacBook Pro, offline heuristic engine:

| Scenario | Time | Heap Δ |
|---|---|---|
| Single URL (safe) | 89.7 ms | -0.29 MB |
| Single URL (phishing) | 231.8 ms | +0.41 MB |
| 100 URLs — concurrency=5 | 20,055 ms | -1.26 MB |
| 100 URLs — concurrency=10 | 11,553 ms | +2.49 MB |
| 1,000 URLs — concurrency=5 | 113,562 ms | +15.65 MB |
| 1,000 URLs — concurrency=20 | 91,451 ms | +2.41 MB |
| 1,000 URLs — **aborted** | **362 ms** ✅ | +0.37 MB |

> Times include real DNS lookups and TLS checks. For cloud mode, the heavy work runs server-side and SDK latency drops to <10ms.

---

## 🗺 Roadmap

- [x] Cross-platform runtime detection (Node, Browser, Edge, RN, Expo, Bun, Deno)
- [x] Heuristic engine (homograph, entropy, keyword, TLD, brand)
- [x] Redirect tracing with SSRF + DNS rebinding protection
- [x] TLS/certificate validation
- [x] Plugin and provider system
- [x] Policy engine (10 built-in policies)
- [x] Cloud platform SDK + API gateway
- [x] Real-time threat feed (SSE)
- [x] Telemetry batching with offline queue
- [x] Safe Link Intelligence Network (SLIN)
- [ ] AI-powered classification (GPT-4o / Gemini)
- [ ] Browser extension
- [ ] VSCode extension (hover URL safety)
- [ ] Mobile SDK (Swift, Kotlin)
- [ ] Threat intelligence data API

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/Rajeev766/safe-link-checker
cd safe-link-checker
npm install
npm run build
npm test
```

---

## 🔒 Security

Found a vulnerability? **Please do not open a public issue.**

See [SECURITY.md](./.github/SECURITY.md) for our responsible disclosure process.

---

## 📄 License

MIT © [Rajeev Choudhary](https://github.com/Rajeev766)

---

<p align="center">
  <a href="https://github.com/Rajeev766/safe-link-checker/blob/main/CHANGELOG.md">Changelog</a> ·
  <a href="https://github.com/Rajeev766/safe-link-checker/discussions">Discussions</a> ·
  <a href="https://github.com/Rajeev766/safe-link-checker/issues">Issues</a>
</p>
