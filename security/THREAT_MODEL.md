# Threat Model

This document outlines the threat model for `safe-link-checker`, evaluating potential attack vectors across all supported runtimes.

## 1. Scope
The scope includes the core heuristic engine, the runtime adapters (Node, Browser, Edge), and the network request logic (redirect tracing, provider lookups).

## 2. Threat Actors
- **External Attackers**: Attempting to bypass the filter (e.g., via obfuscation, homographs, or SSRF payloads).
- **Compromised Dependencies**: Supply chain attacks injecting malicious code.
- **Malicious End-Users**: Submitting crafted URLs to cause Denial of Service (DoS).

## 3. Threat Matrix (STRIDE)

### Spoofing
- **Threat**: Homograph / Punycode attacks (e.g., `аpple.com`).
- **Mitigation**: `HomographPlugin` mathematically compares character entropy and flags mixed-script domains.

### Tampering
- **Threat**: Cache Poisoning.
- **Mitigation**: The internal LRU cache uses strict key derivations (SHA-256 of the normalized URL and options).

### Repudiation
- **Threat**: Lack of audit trails for blocked URLs.
- **Mitigation**: The `VerificationResult` returns a complete, deterministic `evidence` array explaining exactly why a decision was reached.

### Information Disclosure
- **Threat**: Server-Side Request Forgery (SSRF).
- **Mitigation**: The Node runtime explicitly rejects private/bogon IP space (10.x, 192.168.x, 169.254.x, etc.) and blocks DNS Rebinding via connection binding.

### Denial of Service
- **Threat**: Regex DoS (ReDoS) or Infinite Redirect Loops.
- **Mitigation**: All regex patterns are bounded. The Redirect Tracer enforces a strict `maxRedirects` limit and a global `timeout`. Bounded Concurrency prevents memory exhaustion on batch jobs.

### Elevation of Privilege
- **Threat**: Code execution via Prototype Pollution or Command Injection.
- **Mitigation**: The SDK does not use `eval()` or child processes. Objects are created without prototypes where appropriate.
