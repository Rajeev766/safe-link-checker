# Safe Link Checker 🛡️

[![npm version](https://img.shields.io/npm/v/safe-link-checker.svg)](https://npmjs.org/package/safe-link-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, lightning-fast **Universal URL Intelligence SDK**. `SafeLinkChecker` protects against phishing, malware, SSRF bypasses, DNS rebinding, and malicious payloads. It works seamlessly across Node.js, React Native, Browser, Next.js, Electron, Bun, and Deno with a unified API.

## Features ✨
- **Write Once, Run Anywhere**: Automatically detects the runtime environment to serve the best implementation.
- **Frontend Verification**: React Native, Expo, and Web Apps execute fast local checks (URL extraction, punycode, homographs, regex rules) in <10ms.
- **Backend Verification**: Node.js/Bun servers enrich analysis with deep network checks (DNS rebinding, HTTPS certificates, redirect tracing) and Threat Intelligence Providers (URLHaus, OpenPhish).
- **Consensus & Policy Engine**: Configurable policies calculate trust scores and decide actions (`allow`, `warn`, `block`).

## Installation 📦

```bash
npm install safe-link-checker
```
> **One package.** Installs the correct bundle for your platform automatically.

## Compatibility Matrix 📊

| Feature \ Platform | Node.js / Bun | React Native / Expo | Browser / Web |
|:---|:---:|:---:|:---:|
| URL Normalization | ✅ | ✅ | ✅ |
| URL Extraction | ✅ | ✅ | ✅ |
| Regex / Heuristics | ✅ | ✅ | ✅ |
| Homograph / Punycode| ✅ | ✅ | ✅ |
| Private IP / SSRF | ✅ | ✅ | ✅ |
| Explainable Scoring | ✅ | ✅ | ✅ |
| Cache Engine | ✅ | ✅ | ✅ |
| DNS Lookup | ✅ | ❌ | ❌ |
| HTTPS Certificate | ✅ | ❌ | ❌ |
| Redirect Tracing | ✅ | ❌ | ❌ |
| Threat Providers | ✅ | ❌ | ❌ |

## Quick Start 🚀

### In Node.js / Backend

```typescript
import { SafeLinkChecker, verifyLink } from 'safe-link-checker';

// Uses Node.js networking, DNS, and Threat Intelligence automatically
const checker = new SafeLinkChecker({
  providers: ['urlhaus', 'openphish'],
  cache: true,
  checkHttps: true,
});

const result = await checker.verify('https://example.com');
console.log(result.runtime); // 'node'
console.log(result.decision); // 'allow'
console.log(result.capabilities.performed); // ['UrlValidation', 'HttpsValidation', ...]
```

### In React Native / Browser (e.g. Chat Composer)

```typescript
import { SafeLinkChecker, extractUrls } from 'safe-link-checker';

// Fast local execution - blocks obvious threats before they are sent
const checker = new SafeLinkChecker();

const text = "Check this out: http://google.com and http://evil.com/exe";
const urls = extractUrls(text);

const results = await checker.verifyLinks(urls);
const blockedUrls = results.filter(r => r.decision === 'block');

if (blockedUrls.length > 0) {
    alert('Malicious link detected! Please remove before sending.');
}
```

## Result Model

Both runtimes return the exact same structured result format:

```typescript
{
    url: 'https://evil.com',
    safe: false,
    decision: 'block',
    score: 100,
    confidence: 90,
    riskLevel: 'DANGEROUS',
    summary: 'Detected suspicious patterns.',
    action: 'block',
    runtime: 'react-native',
    capabilities: {
      performed: ['UrlValidation', 'Punycode', 'Heuristics'],
      skipped: ['dns', 'certificate', 'redirect_trace']
    }
}
```

## Security 🔒
Please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.

## License 📄
[MIT](LICENSE) © 2026 Rajeev Choudhary
