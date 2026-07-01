# Trust Score

Every URL verification returns a **trust score** — a number from 0 to 100 representing how safe the SDK believes a URL to be.

## How It Works

```
trustScore: 0          → Most dangerous (known malware/phishing)
trustScore: 1–30       → Dangerous (strong evidence of threat)
trustScore: 31–50      → Suspicious (multiple risk signals)
trustScore: 51–70      → Unverified (some risk indicators)
trustScore: 71–89      → Probably safe (minor concerns)
trustScore: 90–100     → Safe (no meaningful risk signals)
```

## Score Composition

The trust score is computed by the **Reputation Engine** which aggregates signals from all active plugins:

```
trustScore = 100 - Σ(plugin.scoreImpact × plugin.weight × confidence)
```

Each plugin returns a `CheckResult` with:
- `safe: boolean` — did this check pass?
- `scoreImpact: number` — how much to deduct if not safe (0–100)
- `confidence: number` — how certain this plugin is (0–100)
- `weight: number` — relative importance of this plugin

## Decision Thresholds

The [policy](/guide/policies) maps the trust score to a final `decision`:

| trustScore | `balanced` policy | `strict` policy | `messaging` policy |
|---|---|---|---|
| 90–100 | ALLOW | ALLOW | ALLOW |
| 70–89 | ALLOW | WARN | ALLOW |
| 50–69 | WARN | BLOCK | WARN |
| 30–49 | BLOCK | BLOCK | BLOCK |
| 0–29 | BLOCK | BLOCK | BLOCK |

## Risk Score

The `riskScore` is the inverse of `trustScore`:

```
riskScore = 100 - trustScore
```

Use `riskScore` when you want higher numbers to mean more dangerous (e.g., for risk dashboards).

## Confidence

The `confidence` field (0–100) indicates how certain the engine is about its verdict.

- **High confidence (>80)**: Multiple strong signals agree
- **Medium confidence (50–80)**: Some conflicting signals
- **Low confidence (<50)**: Insufficient data, few signals fired

Low confidence results may benefit from cloud verification or manual review.

## Reading Evidence

Each evidence item that contributed to the score:

```typescript
result.evidence.forEach(e => {
  console.log(`${e.name}: ${e.safe ? '✅' : `⚠️ -${e.scoreImpact}pts`}`);
  // HomographDetection: ⚠️ -30pts
  // BrandImpersonation: ⚠️ -25pts
  // SuspiciousKeyword: ⚠️ -15pts
  // ProtocolValid: ✅
});
```

## Real-World Examples

| URL | trustScore | decision | reason |
|---|---|---|---|
| `https://google.com` | 95 | ALLOW | No risk signals |
| `https://bit.ly/3xyz` | 65 | WARN | URL shortener |
| `https://paypal-secure.xyz` | 12 | BLOCK | Brand impersonation, suspicious keyword, low-trust TLD |
| `https://xn--pple-43d.com` | 5 | BLOCK | Punycode homograph (apple → аpple) |
| `http://192.168.1.1` | 0 | BLOCK | Private IP address (SSRF) |
