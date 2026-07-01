# Policies

Policies control how trust scores map to final decisions. Choose a built-in policy or define your own.

## Built-in Policies

### `balanced` (default)

Best for general-purpose applications. Blocks known threats, warns on suspicious URLs.

```typescript
const checker = new SafeLinkChecker({ policy: 'balanced' });
```

| trustScore | Decision |
|---|---|
| ≥ 70 | ALLOW |
| 40–69 | WARN |
| < 40 | BLOCK |

---

### `strict`

Best for high-security applications (financial, healthcare, government). Warns on any uncertainty.

```typescript
const checker = new SafeLinkChecker({ policy: 'strict' });
```

| trustScore | Decision |
|---|---|
| ≥ 85 | ALLOW |
| 60–84 | WARN |
| < 60 | BLOCK |

---

### `messaging`

Optimized for chat and messaging applications. Lets most URLs through but blocks obvious threats.

```typescript
const checker = new SafeLinkChecker({ policy: 'messaging' });
```

| trustScore | Decision |
|---|---|
| ≥ 50 | ALLOW |
| 25–49 | WARN |
| < 25 | BLOCK |

---

### `parental`

Maximum protection for children's content. Blocks anything uncertain.

```typescript
const checker = new SafeLinkChecker({ policy: 'parental' });
```

---

### `financial`

For fintech and banking applications. Strict on anything that could be payment fraud.

```typescript
const checker = new SafeLinkChecker({ policy: 'financial' });
```

---

### `enterprise`

For corporate environments. Blocks unknown domains and requires whitelist.

```typescript
const checker = new SafeLinkChecker({ policy: 'enterprise' });
```

---

### `developer`

Lenient policy for developer tools and documentation. Allows most URLs, warns on known threats.

```typescript
const checker = new SafeLinkChecker({ policy: 'developer' });
```

---

### `social`

For social media platforms. Allows most user content, blocks spam patterns.

---

### `healthcare`

For medical applications. Strict on unauthorized redirects and data-harvesting patterns.

---

### `government`

Maximum security. Strict certificate requirements, no URL shorteners.

---

## Custom Policy Rules

Define declarative rules that trigger on specific evidence:

```typescript
const checker = new SafeLinkChecker({
  policy: 'balanced',
  rules: [
    {
      id: 'block-competitor-domains',
      condition: { any: ['competitor-domain'] },
      action: 'BLOCK',
      message: 'Competitor domain not allowed'
    },
    {
      id: 'escalate-financial-phishing',
      condition: {
        all: ['brand-impersonation'],
        hasCategory: ['domain']
      },
      action: 'ESCALATE',
      message: 'Potential financial phishing — escalate for manual review'
    }
  ]
});
```

### Rule Conditions

| Condition | Description |
|---|---|
| `all: string[]` | All evidence names must be present |
| `any: string[]` | At least one evidence name must be present |
| `none: string[]` | None of the evidence names must be present |
| `hasCategory: string[]` | At least one evidence item must have this category |

### Rule Actions

| Action | Description |
|---|---|
| `ALLOW` | Force-allow the URL regardless of score |
| `WARN` | Override decision to WARN |
| `REVIEW` | Flag for manual review queue |
| `BLOCK` | Override decision to BLOCK |
| `ESCALATE` | Escalate to security team |
