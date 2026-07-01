# Maintainer Guidelines

Welcome to the "safe-link-checker" maintainer team! 

## Triaging Issues

1. **Acknowledge quickly**: Try to respond to new issues within 48 hours.
2. **Apply labels**:
   - `status: needs reproduction`
   - `type: bug`, `type: enhancement`
   - `priority: high`, `priority: low`

## Reviewing Pull Requests

1. **Be welcoming**: Thank the contributor for their time.
2. **Review for quality**: Ensure tests pass, types are correct, and bundle size hasn't ballooned.
3. **No breaking changes**: We adhere strictly to SemVer. Breaking changes must go into a `next` branch for a major release.

## Releasing

Releases are fully automated via Changesets and GitHub Actions.
1. Merge the `Version Packages` PR created by the changesets bot.
2. The GitHub Action will automatically publish to npm and create GitHub releases.
