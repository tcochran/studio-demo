# Contributing

Thank you for your interest in contributing to Quiz Lab! This document outlines the workflow for getting started, running tests, and submitting changes.

## Setup

- Clone the repository and navigate to the `app/` directory.
- Run `corepack enable && corepack prepare pnpm@latest --activate` to enable pnpm.
- Install dependencies with `pnpm install`.
- Start the development server with `pnpm run dev` and open `http://localhost:5173`.
- For production builds, use `pnpm run build` followed by `pnpm run preview`.

## Running tests

- Run the full test suite once with `pnpm test` (uses Vitest).
- Generate a coverage report with `pnpm test:coverage`.
- Tests live alongside the source files and use Vitest's default glob pattern.
- Run type-checking with `pnpm check` (svelte-check with TypeScript).
- Use `pnpm check:watch` for continuous type-checking during development.

## Submitting a PR

- Create a feature branch from `main` with a descriptive name.
- Make your changes and ensure the test suite passes with `pnpm test && pnpm check`.
- Follow the existing data shape — see `app/src/lib/packs.ts` for the pack schema.
- Open a pull request against `main` with a clear title and description of your changes.
- A preview URL is posted automatically via the GitHub Actions workflow once the PR is opened.
