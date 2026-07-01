# Blog Post Templates

## Post 1: Why Regex is Not Enough for URL Validation

**Target Audience**: Junior/Mid-level Web Developers
**Platform**: Dev.to, Hashnode

**Outline**:
1. **The Trap**: Everyone reaches for `/^https?:///` when building a form.
2. **The Problem**: Show a perfectly valid URL that is actually a phishing link. Show an SSRF attack (`http://169.254.169.254`).
3. **The Solution**: Explain how `safe-link-checker` looks at *intent* and *reputation*, not just syntax.
4. **Code Snippet**: Show the 5-minute quick start.

---

## Post 2: Building a Real-time URL Scanner in React Native

**Target Audience**: Mobile Developers
**Platform**: Medium, React Native Newsletter

**Outline**:
1. **The UX Problem**: Mobile deep links are a massive attack vector.
2. **The Constraints**: You can't ship a heavy Node.js library to a mobile app.
3. **The Implementation**: Show how `safe-link-checker` automatically uses the `fetch` API under the hood in RN to do heuristic and cloud checks.
4. **Code Snippet**: The `SafeLink.ts` wrapper.
