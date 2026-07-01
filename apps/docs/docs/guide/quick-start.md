# Quick Start

Get URL threat detection running in under 5 minutes.

## Step 1 — Install

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

## Step 2 — Your First Check

```typescript
import { verifyLink } from 'safe-link-checker';

const result = await verifyLink('https://paypal-secure-login.xyz');

console.log(result.safe);            // false
console.log(result.trustScore);      // 8
console.log(result.decision);        // 'BLOCK'
console.log(result.classification);  // 'Phishing'
console.log(result.summary);         // 'URL exhibits multiple high-risk...'
```

That's it. The heuristic engine runs offline — no API key required.

## Step 3 — Handle the Result

```typescript
import { verifyLink } from 'safe-link-checker';

async function handleUserLink(url: string) {
  const result = await verifyLink(url);

  switch (result.decision) {
    case 'ALLOW':
      // Safe — proceed
      return { safe: true, url: result.normalizedUrl };

    case 'WARN':
      // Suspicious — show a warning to the user
      return {
        safe: false,
        warning: true,
        message: result.summary,
        url: result.normalizedUrl,
      };

    case 'BLOCK':
    case 'ESCALATE':
      // Dangerous — block entirely
      return {
        safe: false,
        blocked: true,
        message: result.summary,
        evidence: result.evidence,
      };
  }
}
```

## Step 4 — Add Threat Providers (Optional)

For production, add real-time threat intelligence:

```typescript
import { SafeLinkChecker } from 'safe-link-checker';

const checker = new SafeLinkChecker({
  providers: ['openphish', 'urlhaus'],  // real-time threat feeds
  policy: 'strict',                     // block suspicious too
  cache: true,                          // cache results for 1 hour
});

const result = await checker.verify('https://example.com');
```

## Step 5 — Batch Verification

Verify many URLs in parallel (great for messaging apps):

```typescript
import { verifyLinks, extractUrls } from 'safe-link-checker';

const message = 'Visit https://google.com or http://free-crypto-login.xyz';
const urls = extractUrls(message);

const results = await verifyLinks(urls, {}, /* concurrency= */ 5);
const blocked = results.filter(r => r.decision === 'BLOCK');

if (blocked.length > 0) {
  console.warn(`${blocked.length} unsafe URL(s) in message`);
}
```

## What's Next?

<div class="grid grid-cols-2 gap-4 mt-4">

- 📖 [Configuration Reference](/guide/configuration) — all available options
- 🌐 [Platform Guides](/guide/platforms/node) — Node, React Native, Edge, Expo
- 🎛️ [Policies](/guide/policies) — strict, messaging, financial, and more
- 🔌 [Plugins & Providers](/guide/plugins) — extend with custom logic
- 📊 [Understanding Results](/guide/trust-score) — trust scores explained
- ☁️ [Cloud Mode](/guide/cloud/overview) — real-time threat intelligence

</div>
