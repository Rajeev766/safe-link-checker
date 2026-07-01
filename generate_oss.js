import fs from 'fs';
import path from 'path';

const OSS_DIR = path.join(process.cwd(), '.oss');
const RFC_DIR = path.join(OSS_DIR, 'RFCs');

if (!fs.existsSync(OSS_DIR)) fs.mkdirSync(OSS_DIR, { recursive: true });
if (!fs.existsSync(RFC_DIR)) fs.mkdirSync(RFC_DIR, { recursive: true });

const files = {
  'GOVERNANCE.md': `# Governance

\`safe-link-checker\` is an independent, community-driven open-source project.

## Core Team

The Core Team is responsible for the overall direction, vision, and health of the project.
- **Rajeev Choudhary** (@Rajeev766) - Creator & Lead Architect

## Working Groups

We organize complex work into Working Groups (WGs). Anyone can participate.
- **WG-Heuristics**: Improving offline detection capabilities.
- **WG-Integrations**: Building adapters for modern web frameworks.
- **WG-Security**: Handling vulnerability reports and maintaining threat feeds.

## Decision Making

Most decisions are made through lazy consensus on GitHub Pull Requests.
For significant architectural changes, we require a formal RFC (Request For Comments).

See the [RFC Process](./RFCs/000-rfc-process.md) for details.
`,
  'MAINTAINERS_GUIDE.md': `# Maintainer Guidelines

Welcome to the "safe-link-checker" maintainer team! 

## Triaging Issues

1. **Acknowledge quickly**: Try to respond to new issues within 48 hours.
2. **Apply labels**:
   - \`status: needs reproduction\`
   - \`type: bug\`, \`type: enhancement\`
   - \`priority: high\`, \`priority: low\`

## Reviewing Pull Requests

1. **Be welcoming**: Thank the contributor for their time.
2. **Review for quality**: Ensure tests pass, types are correct, and bundle size hasn't ballooned.
3. **No breaking changes**: We adhere strictly to SemVer. Breaking changes must go into a \`next\` branch for a major release.

## Releasing

Releases are fully automated via Changesets and GitHub Actions.
1. Merge the \`Version Packages\` PR created by the changesets bot.
2. The GitHub Action will automatically publish to npm and create GitHub releases.
`,
  'SECURITY_HALL_OF_FAME.md': `# Security Hall of Fame

We take the security of "safe-link-checker" and the applications that rely on it very seriously. 

We would like to thank the following security researchers for responsibly disclosing vulnerabilities and helping us improve the ecosystem.

## 2026
**(Reserved for future disclosures)*

## Reporting a Vulnerability
Please see our [SECURITY.md](../.github/SECURITY.md) file for instructions on how to securely report vulnerabilities.

We aim to acknowledge reports within 24 hours and issue a CVE and patch for confirmed critical vulnerabilities within 48 hours.
`,
  'RFCs/000-rfc-process.md': `# RFC Process

## What is an RFC?

The "Request for Comments" (RFC) process is intended to provide a consistent and controlled path for major features to enter the \`safe-link-checker\` ecosystem.

You need to write an RFC if you intend to:
- Introduce a breaking API change.
- Add a new runtime integration layer (e.g., a completely new JS engine).
- Significantly alter the heuristic scoring algorithm.
- Add a new core concept to the Plugin API.

## How to submit an RFC

1. Fork the repository.
2. Copy \`000-template.md\` to \`RFCs/000-your-feature.md\`.
3. Fill in the RFC. Put care into the details.
4. Submit a Pull Request.

The Core Team will review the RFC. Once consensus is reached, the PR will be merged, and the RFC becomes "Active". You may then begin implementation.
`,
  'RFCs/000-template.md': `# RFC Template

- Start Date: (fill me in with today's date, YYYY-MM-DD)
- RFC PR: (leave this empty)
- GitHub Issue: (leave this empty)

## Summary
One paragraph explanation of the feature.

## Motivation
Why are we doing this? What use cases does it support?

## Detailed design
This is the bulk of the RFC. Explain the design in enough detail for somebody familiar with the codebase to understand.

## Drawbacks
Why should we *not* do this?

## Alternatives
What other designs have been considered?
`
};

Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(OSS_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created .oss/' + relPath);
});
