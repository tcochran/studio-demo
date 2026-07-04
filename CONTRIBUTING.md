# Contributing to Quiz Lab

Thank you for your interest in contributing to Quiz Lab! This guide will help you get set up, run tests, and submit changes.

## Setup

1. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone https://github.com/tcochran/studio-demo.git
   cd studio-demo
   ```

2. **Install dependencies** using pnpm:
   ```bash
   cd app
   corepack enable && corepack prepare pnpm@latest --activate
   pnpm install
   ```

3. **Launch the development server**:
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:5173` to view the application.

## Running tests

1. **From the `app` directory**, run the test suite:
   ```bash
   pnpm run test
   ```

2. **For test coverage reports**:
   ```bash
   pnpm run test:coverage
   ```

3. **Check TypeScript and Svelte types**:
   ```bash
   pnpm run check
   ```

4. **Run tests in watch mode**:
   ```bash
   pnpm run test -- --watch
   ```

## Submitting a PR

1. **Create a feature branch** from `main`:
   ```bash
   git switch -c feature/your-branch-name
   ```

2. **Make changes and commit** with descriptive messages:
   ```bash
   git add -A
   git commit -m "feat: description of changes"
   ```

3. **Push your branch** and open a pull request:
   ```bash
   git push -u origin feature/your-branch-name
   ```

4. **Ensure all tests pass** and your PR description includes:
   - The problem solved or feature added
   - Any relevant screenshots or demo links
   - A brief overview of implementation

5. **Address review feedback** promptly and keep your branch up-to-date with `main`.

For new pack additions, see the [README](./README.md#adding-a-new-pack) for specific guidelines.