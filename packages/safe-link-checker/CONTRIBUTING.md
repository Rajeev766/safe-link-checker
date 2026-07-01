# Contributing to SafeLinkChecker

First off, thank you for considering contributing to `SafeLinkChecker`. It's people like you that make open-source software great.

## Development Setup

1. **Fork** and **Clone** the repository.
2. Ensure you are running Node.js 18.0.0 or higher.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the build to ensure everything works out of the box:
   ```bash
   npm run build
   ```

## Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes.
3. Run the tests to ensure nothing is broken:
   ```bash
   npm run test
   ```
4. If you are adding a new feature or fixing a bug, please add a test case for it.
5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, as this project uses automated semantic versioning.
6. Push to your fork and submit a Pull Request.

## Coding Standards

- We use TypeScript. Ensure strict typing is maintained. Avoid `any` types.
- Follow the existing linting rules (`npm run lint`).
- Ensure all public APIs are documented with TSDoc comments.

Thank you!
