# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - Initial Open Source Release
### Added
- Core safety engine with modular `SafeLinkChecker` class.
- Extensible Plugin Architecture via `.use(provider)`.
- Weighted scoring engine with reasons and actionable recommendations.
- Validation suite:
  - Basic URL syntax validator.
  - Local/private IP detector (SSRF protection).
  - HTTPS verifier.
  - Punycode homograph attack detector.
  - URL shortener expander and detector.
- Threat Intelligence Providers:
  - `URLHausProvider`
  - `OpenPhishProvider`
- In-memory `LRUCache` with configurable `maxSize` and `ttlMs`.
- CLI interface (`safe-link-checker`) supporting JSON and colored output.
- Full TypeScript support with CJS and ESM dual-builds via `tsup`.
- High coverage test suite.
