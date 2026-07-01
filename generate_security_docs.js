import fs from 'fs';
import path from 'path';

const SECURITY_DIR = path.join(process.cwd(), 'security');
if (!fs.existsSync(SECURITY_DIR)) fs.mkdirSync(SECURITY_DIR, { recursive: true });

const files = {
  'THREAT_MODEL.md': `# Threat Model

This document outlines the threat model for \`safe-link-checker\`, evaluating potential attack vectors across all supported runtimes.

## 1. Scope
The scope includes the core heuristic engine, the runtime adapters (Node, Browser, Edge), and the network request logic (redirect tracing, provider lookups).

## 2. Threat Actors
- **External Attackers**: Attempting to bypass the filter (e.g., via obfuscation, homographs, or SSRF payloads).
- **Compromised Dependencies**: Supply chain attacks injecting malicious code.
- **Malicious End-Users**: Submitting crafted URLs to cause Denial of Service (DoS).

## 3. Threat Matrix (STRIDE)

### Spoofing
- **Threat**: Homograph / Punycode attacks (e.g., \`аpple.com\`).
- **Mitigation**: \`HomographPlugin\` mathematically compares character entropy and flags mixed-script domains.

### Tampering
- **Threat**: Cache Poisoning.
- **Mitigation**: The internal LRU cache uses strict key derivations (SHA-256 of the normalized URL and options).

### Repudiation
- **Threat**: Lack of audit trails for blocked URLs.
- **Mitigation**: The \`VerificationResult\` returns a complete, deterministic \`evidence\` array explaining exactly why a decision was reached.

### Information Disclosure
- **Threat**: Server-Side Request Forgery (SSRF).
- **Mitigation**: The Node runtime explicitly rejects private/bogon IP space (10.x, 192.168.x, 169.254.x, etc.) and blocks DNS Rebinding via connection binding.

### Denial of Service
- **Threat**: Regex DoS (ReDoS) or Infinite Redirect Loops.
- **Mitigation**: All regex patterns are bounded. The Redirect Tracer enforces a strict \`maxRedirects\` limit and a global \`timeout\`. Bounded Concurrency prevents memory exhaustion on batch jobs.

### Elevation of Privilege
- **Threat**: Code execution via Prototype Pollution or Command Injection.
- **Mitigation**: The SDK does not use \`eval()\` or child processes. Objects are created without prototypes where appropriate.
`,
  'ARCHITECTURE.md': `# Security Architecture

\`safe-link-checker\` is designed with a defense-in-depth architecture.

## 1. Runtime Isolation
The universal entrypoint (\`packages/safe-link-checker\`) delegates execution to specific runtime adapters. 
- The Browser/Edge runtime has **no access** to the Node \`net\` or \`tls\` modules, physically preventing SSRF vulnerabilities in client-side environments.

## 2. The Plugin Pipeline
Plugins execute sequentially based on priority. 
- Fast, local heuristic plugins run first.
- If a fatal threat is detected early, network requests (Providers, TLS checks) are short-circuited to conserve resources and prevent leakage.

## 3. Strict Normalization
Before any plugin runs, the URL is strictly normalized. This defeats bypasses relying on path obfuscation, uppercase schemes, or trailing dot evasion.

## 4. Default Deny on Network Level
In Node.js, the HTTP client used for redirect tracing and TLS validation operates on a default-deny model for local and private IP addresses.
`,
  'INCIDENT_RESPONSE.md': `# Incident Response Playbook

This playbook defines how the \`safe-link-checker\` core team handles critical vulnerabilities.

## Phase 1: Identification and Triage
- Vulnerability reported via \`security@example.com\`.
- Core maintainer acknowledges receipt within 24 hours.
- CVSS score is assessed. If Critical/High, the IR process begins.

## Phase 2: Containment and Fix
- Work occurs in a private security advisory on GitHub.
- A patch is developed.
- Automated tests (including fuzz tests) are written to ensure the specific vector is neutralized.

## Phase 3: Release and Disclosure
- The patch is published to npm.
- A GitHub Security Advisory (GHSA) and CVE are issued.
- Ecosystem partners (Next.js, Vercel, etc.) are notified if the vulnerability impacts widespread frameworks.

## Phase 4: Post-Mortem
- A blameless post-mortem is published to the repository explaining the root cause and the architectural changes made to prevent recurrence.
`,
  'PRIVACY_GUIDE.md': `# Privacy & Data Handling Guide

\`safe-link-checker\` respects end-user privacy by default.

## 1. Offline Mode (Default)
By default, \`safe-link-checker\` runs entirely locally (Offline Mode).
- **No data leaves the device/server.** 
- Heuristics, Homograph detection, and Entropy analysis occur in-memory.

## 2. Cloud Mode / Providers
If you explicitly enable Providers (e.g., \`URLHaus\`, \`OpenPhish\`) or use the \`Safe Link Cloud\` gateway:
- Only the URL and metadata (timestamp, runtime) are transmitted.
- **Data Minimization**: Query parameters containing PII (e.g., \`?token=xxx&email=yyy\`) are scrubbed by the normalization engine *before* being transmitted to external providers.

## 3. GDPR and CCPA Compliance
Because the SDK scrubs PII from URLs prior to network transmission, it acts as a privacy-enhancing intermediary, aiding in GDPR/CCPA compliance for downstream logs.
`,
  'COMPLIANCE.md': `# Compliance Mapping

## OWASP Application Security Verification Standard (ASVS)
\`safe-link-checker\` assists applications in meeting the following ASVS v4.0.3 controls:
- **V5.1.5**: Verify that the application protects against SSRF. *(Handled via our Node runtime DNS rebinding & private IP blocks)*.
- **V11.1.4**: Verify that URLs are properly validated. *(Handled via the core heuristic engine)*.
- **V14.4.1**: Verify that communication with external APIs uses TLS. *(Handled via \`HttpsValidationPlugin\`)*.

## SOC 2
The SDK's deterministic output (\`evidence\` arrays) provides the necessary audit trails required for SOC 2 compliance regarding data validation and threat interception.

## OpenSSF Best Practices
We adhere to the Open Source Security Foundation best practices, enforcing signed commits, mandatory 2FA for npm publishers, SLSA Level 3 provenance, and automated SBOM generation.
`
};

Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(SECURITY_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created security/' + relPath);
});
