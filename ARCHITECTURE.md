# Security Architecture

`safe-link-checker` is designed with a defense-in-depth architecture.

## 1. Runtime Isolation
The universal entrypoint (`packages/safe-link-checker`) delegates execution to specific runtime adapters. 
- The Browser/Edge runtime has **no access** to the Node `net` or `tls` modules, physically preventing SSRF vulnerabilities in client-side environments.

## 2. The Plugin Pipeline
Plugins execute sequentially based on priority. 
- Fast, local heuristic plugins run first.
- If a fatal threat is detected early, network requests (Providers, TLS checks) are short-circuited to conserve resources and prevent leakage.

## 3. Strict Normalization
Before any plugin runs, the URL is strictly normalized. This defeats bypasses relying on path obfuscation, uppercase schemes, or trailing dot evasion.

## 4. Default Deny on Network Level
In Node.js, the HTTP client used for redirect tracing and TLS validation operates on a default-deny model for local and private IP addresses.
