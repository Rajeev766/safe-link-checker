# Configuration

All configuration is passed to `SafeLinkChecker` or as the second argument to the standalone functions.

## SafeLinkChecker Options

```typescript
import { SafeLinkChecker } from 'safe-link-checker';

const checker = new SafeLinkChecker({
  // Threat intelligence providers
  providers: ['openphish', 'urlhaus'],

  // Security policy
  policy: 'balanced',

  // Enable LRU cache
  cache: true,

  // Timeout per URL (ms)
  timeout: 5000,

  // Max redirects to follow
  maxRedirects: 5,

  // Skip TLS certificate validation
  checkHttps: true,

  // Cloud mode (optional)
  mode: 'local',       // 'local' | 'cloud' | 'hybrid'
  endpoint: undefined, // cloud API URL (if mode !== 'local')
  apiKey: undefined,   // cloud API key

  // Observability hooks
  hooks: {
    onStart: (url, options) => {},
    onFinish: (result) => {},
    onWarning: (url, reasons) => {},
    onBlocked: (url, reasons) => {},
  },
});
```

## Full Options Reference

### `providers`
**Type:** `('openphish' | 'urlhaus' | Provider)[]`  
**Default:** `[]`

Threat intelligence providers to query during verification. Built-in providers:
- `'openphish'` — OpenPhish community phishing feed
- `'urlhaus'` — Abuse.ch URLhaus malware feed

```typescript
providers: ['openphish', 'urlhaus']
```

---

### `policy`
**Type:** `PolicyName | PolicyConfig`  
**Default:** `'balanced'`

Controls how the trust score maps to decisions. See [Policies →](/guide/policies)

```typescript
policy: 'strict' // 'balanced' | 'strict' | 'messaging' | 'financial' | ...
```

---

### `cache`
**Type:** `boolean | LRUCache`  
**Default:** `false`

Enable or disable result caching. Pass `true` to use the default LRU cache (max 1000 entries, 1-hour TTL), or pass a custom `LRUCache` instance.

```typescript
import { LRUCache } from 'safe-link-checker';

cache: new LRUCache({ maxSize: 500, ttlMs: 30 * 60 * 1000 })
```

---

### `timeout`
**Type:** `number` (milliseconds)  
**Default:** `5000`

Maximum time to wait for network operations (DNS lookup, HTTP probe, TLS handshake).

---

### `maxRedirects`
**Type:** `number`  
**Default:** `5`

Maximum number of HTTP redirects to follow before flagging `MAX_REDIRECTS_EXCEEDED`.

---

### `checkHttps`
**Type:** `boolean`  
**Default:** `true`

Whether to validate TLS certificates on HTTPS URLs. Set to `false` in test environments.

---

### `mode`
**Type:** `'local' | 'cloud' | 'hybrid'`  
**Default:** `'local'`

- `'local'` — All analysis runs in-process. Works offline. No external dependencies.
- `'cloud'` — Delegates all analysis to the Safe Link Cloud API. Requires `endpoint` and `apiKey`.
- `'hybrid'` — Runs local analysis first, falls back to cloud for low-confidence results.

---

### `signal`
**Type:** `AbortSignal`  
**Default:** `undefined`

An `AbortSignal` to cancel the verification mid-flight. Useful for timeouts and user-initiated cancellation.

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 3000);

const result = await checker.verify(url, { signal: controller.signal });
```

---

## VerifyOptions (per-call override)

All options above can also be passed as the second argument to `verify()` or `verifyLinks()` to override on a per-call basis:

```typescript
const result = await checker.verify(url, {
  timeout: 10000,
  policy: 'strict',
  signal: abortController.signal,
});
```

---

## Environment Variables

When using the cloud API:

```bash
SAFE_LINK_API_KEY=sk_live_xxxx
SAFE_LINK_ENDPOINT=https://api.safelink.dev
```

```typescript
const checker = new SafeLinkChecker({
  mode: 'cloud',
  apiKey: process.env.SAFE_LINK_API_KEY,
  endpoint: process.env.SAFE_LINK_ENDPOINT,
});
```
