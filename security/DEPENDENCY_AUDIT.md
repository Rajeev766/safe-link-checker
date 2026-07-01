# Dependency Security Audit

As part of our commitment to Enterprise Security and Supply Chain Integrity, the \`safe-link-checker\` core team has audited all production dependencies. We follow a strict minimization policy: every dependency must be strictly necessary, highly maintained, and free of known vulnerabilities.

## Audit Date
2026-07-02

## Audited Dependencies

### 1. `ipaddr.js`
- **Purpose**: Parsing and validating IPv4 and IPv6 addresses to detect SSRF vectors (e.g., IPv4-mapped IPv6).
- **Maintenance Status**: Active. Maintained by whitequark and others.
- **Security History**: Very strong. One ReDoS vulnerability in 2021 (CVE-2021-4264) which was immediately patched.
- **Alternatives Considered**: `ip`, `net` (Node built-in). `ipaddr.js` is chosen because it runs universally across the Browser and Node, whereas `net` is Node-only.
- **Risk Level**: Low
- **Decision**: Retain.

### 2. `tldts`
- **Purpose**: Extremely fast parsing of top-level domains (TLDs) using a compressed trie representation of the Public Suffix List (PSL).
- **Maintenance Status**: Active.
- **Security History**: No known critical vulnerabilities. Excellent memory safety profile.
- **Alternatives Considered**: `psl`. `tldts` is significantly faster and uses less memory, which is critical for our bundle size and latency constraints.
- **Risk Level**: Low
- **Decision**: Retain.

### 3. `validator`
- **Purpose**: General purpose string validation (isURL, isFQDN).
- **Maintenance Status**: Highly active.
- **Security History**: Has had ReDoS issues in the past, but the maintainers are extremely responsive. We wrap its usage in bounded execution limits to mitigate any potential upstream ReDoS.
- **Alternatives Considered**: Custom Regex. Custom regex is vastly more dangerous and prone to catastrophic backtracking.
- **Risk Level**: Low/Medium
- **Decision**: Retain, with bounded execution wrapping.

### 4. `normalize-url`
- **Purpose**: Normalizing URLs to a standard format (stripping duplicate slashes, sorting query parameters, resolving relative paths) to prevent bypasses.
- **Maintenance Status**: Active (Sindre Sorhus).
- **Security History**: Clean.
- **Alternatives Considered**: `URL` built-in object. We use `URL` where possible, but `normalize-url` handles edge cases (like `HTTP://` -> `http://` and punycode conversion) that standard `URL` objects do inconsistently across older browsers.
- **Risk Level**: Low
- **Decision**: Retain.

## Summary
The production dependency tree of `safe-link-checker` is exceptionally shallow. There are no abandoned packages, and all packages have strong security histories.
