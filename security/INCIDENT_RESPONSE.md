# Incident Response Playbook

This playbook defines how the `safe-link-checker` core team handles critical vulnerabilities.

## Phase 1: Identification and Triage
- Vulnerability reported via `security@example.com`.
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
