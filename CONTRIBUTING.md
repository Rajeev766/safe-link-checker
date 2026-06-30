# Contributing to safe-link-checker

First off, thank you for considering contributing to `safe-link-checker`!

## Getting Started

1. Fork the repository.
2. Clone your fork locally.
3. Install dependencies: `npm install`

## Development Workflow

1. Create a branch for your feature or bug fix: `git checkout -b my-new-feature`
2. Make your changes in the `src/` directory.
3. If you are adding a new validator or provider, please include corresponding tests in the `tests/` directory.

## Testing

Run the test suite using:

```bash
npm test
```

Please ensure that all tests pass before submitting a Pull Request.

## Linting and Formatting

Run the linter and formatter:

```bash
npm run lint
npm run format
```

## Pull Request Process

1. Ensure your code conforms to the existing style.
2. Update the `README.md` with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations, and container parameters.
3. Submit a pull request to the `main` branch.
