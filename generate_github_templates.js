import fs from 'fs';
import path from 'path';

const GITHUB_DIR = path.join(process.cwd(), '.github');

const templates = {
  // Issue Templates
  'ISSUE_TEMPLATE/bug_report.yml': `name: Bug Report
description: File a bug report for safe-link-checker
labels: ["bug", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting a bug! Please ensure you've checked the [Troubleshooting Guide](https://github.com/Rajeev766/safe-link-checker/blob/main/apps/docs/docs/guide/troubleshooting.md) first.
        
        **SECURITY ISSUES**: Please report security vulnerabilities to security@example.com instead of using this form.
  - type: input
    id: version
    attributes:
      label: safe-link-checker Version
      description: What version of the package are you using?
    validations:
      required: true
  - type: dropdown
    id: environment
    attributes:
      label: Runtime Environment
      description: Where is the bug occurring?
      options:
        - Node.js
        - Browser
        - React Native
        - Expo
        - Next.js Edge/Server
        - Cloudflare Workers
        - Bun
        - Deno
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Describe the bug clearly.
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Reproduction Steps
      description: How can we reproduce this? A minimal CodeSandbox or GitHub repo is highly appreciated.
    validations:
      required: true
`,
  'ISSUE_TEMPLATE/feature_request.yml': `name: Feature Request
description: Suggest an idea for safe-link-checker
labels: ["enhancement"]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: What problem are you trying to solve?
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: How do you think this should be implemented?
    validations:
      required: true
`,
  'ISSUE_TEMPLATE/security.yml': `name: Security Vulnerability
description: Report a security vulnerability
body:
  - type: markdown
    attributes:
      value: |
        **DO NOT USE THIS FORM FOR SECURITY VULNERABILITIES.**
        
        Please read our [Security Policy](../SECURITY.md) and email security@example.com directly.
`,
  
  // PR Template
  'PULL_REQUEST_TEMPLATE.md': `## Description

Please include a summary of the change and which issue is fixed.

Fixes # (issue)

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes (npm test)
- [ ] I have updated the documentation accordingly
`,

  // Core GitHub Files
  'CODEOWNERS': `*       @Rajeev766\n`,
  'FUNDING.yml': `github: [Rajeev766]\n`,
  'SECURITY.md': `# Security Policy

## Supported Versions

Only the latest major version is currently receiving security updates.

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Instead, please report them to **security@example.com**.

We will respond within 24 hours and aim to release a patch within 48 hours for critical issues.
`,

  // Workflows
  'workflows/release.yml': `name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Semantic Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
`
};

Object.entries(templates).forEach(([relPath, content]) => {
  const fullPath = path.join(GITHUB_DIR, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created .github/' + relPath);
});
