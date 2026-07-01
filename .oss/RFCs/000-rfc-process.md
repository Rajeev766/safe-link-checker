# RFC Process

## What is an RFC?

The "Request for Comments" (RFC) process is intended to provide a consistent and controlled path for major features to enter the `safe-link-checker` ecosystem.

You need to write an RFC if you intend to:
- Introduce a breaking API change.
- Add a new runtime integration layer (e.g., a completely new JS engine).
- Significantly alter the heuristic scoring algorithm.
- Add a new core concept to the Plugin API.

## How to submit an RFC

1. Fork the repository.
2. Copy `000-template.md` to `RFCs/000-your-feature.md`.
3. Fill in the RFC. Put care into the details.
4. Submit a Pull Request.

The Core Team will review the RFC. Once consensus is reached, the PR will be merged, and the RFC becomes "Active". You may then begin implementation.
