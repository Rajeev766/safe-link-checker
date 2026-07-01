import fs from 'fs';
import path from 'path';

const RESEARCH_DIR = path.join(process.cwd(), 'research');
if (!fs.existsSync(RESEARCH_DIR)) fs.mkdirSync(RESEARCH_DIR, { recursive: true });

const files = {
  'WHITEPAPER_DRAFT.md': `# Modern Client-Side URL Intelligence

**Abstract**:
As web applications move logic to the edge and the client, URL validation remains stubbornly stuck in the past—reliant on either basic RegEx or slow backend API calls. This paper introduces a modern architecture for a Universal URL Intelligence SDK that brings heuristic threat analysis, homograph detection, and bounded concurrency checks to every JavaScript runtime.

## 1. Introduction
- The state of URL validation (is-url, validator.js)
- The gap: Validation vs. Intelligence
- The rise of Edge computing and the need for universal SDKs

## 2. Threat Models
- Homograph Attacks (Punycode spoofing)
- SSRF (Server-Side Request Forgery) via DNS Rebinding
- Open Redirects and Redirect Chains

## 3. Architecture of safe-link-checker
- Pluggable capability system
- Runtime-agnostic core (Node, Browser, Edge, React Native)
- The Bounded Concurrency Scheduler

## 4. Benchmarks & Performance
- Latency comparisons
- Memory footprint in the browser vs Node
- Caching strategies

## 5. Conclusion
`,
  'BLOG_TEMPLATES.md': `# Blog Post Templates

## Post 1: Why Regex is Not Enough for URL Validation

**Target Audience**: Junior/Mid-level Web Developers
**Platform**: Dev.to, Hashnode

**Outline**:
1. **The Trap**: Everyone reaches for \`/^https?:\/\//\` when building a form.
2. **The Problem**: Show a perfectly valid URL that is actually a phishing link. Show an SSRF attack (\`http://169.254.169.254\`).
3. **The Solution**: Explain how \`safe-link-checker\` looks at *intent* and *reputation*, not just syntax.
4. **Code Snippet**: Show the 5-minute quick start.

---

## Post 2: Building a Real-time URL Scanner in React Native

**Target Audience**: Mobile Developers
**Platform**: Medium, React Native Newsletter

**Outline**:
1. **The UX Problem**: Mobile deep links are a massive attack vector.
2. **The Constraints**: You can't ship a heavy Node.js library to a mobile app.
3. **The Implementation**: Show how \`safe-link-checker\` automatically uses the \`fetch\` API under the hood in RN to do heuristic and cloud checks.
4. **Code Snippet**: The \`SafeLink.ts\` wrapper.
`,
  'CFP.md': `# Conference Call for Papers (CFP) Proposals

## Talk 1: React Conf
**Title**: Stop Validating URLs. Start Analyzing Them.
**Abstract**:
Every React developer has written a form with a URL input. Most of us use a simple Regex or \`validator.js\`. But what happens when a user submits \`https://paypal-secure.com\`? It passes validation, but it's a phishing site. In this talk, we'll explore why client-side URL intelligence is the new standard, and how to build a real-time reputation engine directly into your React components without bloating your bundle size.

## Talk 2: NodeConf
**Title**: Building a Universal Security SDK for the JavaScript Multiverse
**Abstract**:
Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge... the JavaScript runtime ecosystem has exploded. How do you build a security SDK that leverages Node's \`tls\` module when available, but gracefully falls back to \`fetch\` on the Edge, all without requiring developers to change their import paths? We'll dive into the architecture of \`safe-link-checker\` and discuss how to inject capabilities at runtime.

## Talk 3: DEF CON / Black Hat Arsenal
**Title**: Democratizing URL Threat Intelligence
**Abstract**:
Enterprise URL filtering costs thousands of dollars. We built an open-source, universal URL intelligence engine that runs entirely in the client or at the edge. We'll demonstrate how the heuristic engine detects homograph attacks and brand impersonation purely mathematically, bypassing the need for expensive API calls.
`
};

Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(RESEARCH_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created research/' + relPath);
});
