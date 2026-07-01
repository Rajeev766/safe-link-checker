# Marketing Launch Kit

This document contains templates for announcing `safe-link-checker` 1.0.

## 1. Twitter / X Announcement Thread

**Tweet 1:**
Stop validating URLs. Start analyzing them. 🛡️
Today we're launching \`safe-link-checker\` 1.0 — a universal URL intelligence SDK for the JavaScript ecosystem.
Detect phishing, homographs, and SSRF in real-time. Offline. In under 100ms.
👇 Here's how it works.

**Tweet 2:**
Traditional URL validation uses Regex. But regex can't tell if \`https://paypal-secure.com\` is a phishing site, or if \`http://169.254.169.254\` is an SSRF attack.
\`safe-link-checker\` brings a full heuristic reputation engine directly into your client or backend.

**Tweet 3:**
It works *everywhere*. Node, Browser, React Native, Expo, Edge, Bun, Deno.
One import. Zero configuration.
\`\`\`ts
import { verifyLink } from 'safe-link-checker'
const result = await verifyLink(url)
console.log(result.trustScore) // 0-100
\`\`\`

**Tweet 4:**
We've also built a bounded concurrency scheduler, capable of scanning thousands of URLs per second. Perfect for messaging apps and chat interfaces.
Try the playground here: [link]
GitHub: [link]

## 2. Product Hunt Pitch

**Tagline**: The universal URL security SDK for JavaScript.
**Description**:
Every developer has written a form with a URL input. Most use a simple Regex. But what happens when a user submits a valid URL that is actually a phishing site or a malware distributor? 
\`safe-link-checker\` is an open-source, universal URL intelligence engine. It runs heuristic threat analysis, redirect tracing, and TLS validation natively in Node, React Native, and the Browser. Get a Trust Score from 0-100 and protect your users in under 100ms.

## 3. Hacker News Pitch

**Title**: Show HN: safe-link-checker – A universal URL intelligence SDK for JavaScript
**Body**:
Hey HN,
I got tired of seeing simple Regex used to validate URLs in modern apps. While Regex ensures syntax, it does nothing against phishing, homograph attacks (Punycode spoofing), or SSRF. 
I built \`safe-link-checker\` to solve this. It's a reputation engine that runs offline heuristics (entropy, keyword, brand impersonation) and safely follows redirects. It's written in TypeScript and works across Node, the Browser, Edge (Cloudflare/Vercel), and React Native without changing the import path.

Would love to hear your thoughts on the heuristic scoring model!
