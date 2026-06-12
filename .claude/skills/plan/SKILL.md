---
name: plan
description: Plan the change. Activate at the start of phase 2 (Plan), after Bootstrap. Owns the single load-bearing decision of the run — is this a code change (test-first required) or a configuration change (no test required)? The Code phase that follows depends on this judgment, so always consult this skill; your conclusion shapes the rest of the run.
---

# plan

Quiz Lab's planning step. Make exactly one decision before picking up the keyboard: **is this a code change or a configuration change?** Get this wrong and either you waste tool calls writing a test for a comment fix, or you ship a feature without one.

## Definitions

**Code change** — the change introduces or modifies behavior a user or downstream system can observe. The existing test suite would have passed before the change and your new test would have failed before the change. Examples:

- New quiz question (the pack-validation test exercises the new entry)
- New API route, endpoint, or validation rule
- Logic in `app/src/lib/packs.ts` or anywhere under `app/src/`
- Bug fix where the bug is reproducible in a test

**Configuration / doc / data-only change** — the change doesn't introduce new user-visible behavior. Examples:

- README, CLAUDE.md, AGENTS.md, ARCHITECTURE.md edits
- Comments only
- `package.json` metadata (not dependency edits)
- `.env.example`, `.gitignore`, `tsconfig.json` tweaks
- Data asset that lives entirely in static content and isn't asserted on shape

## Required workflow

### Code change → test-first

1. Identify the test file adjacent to what you'll edit (e.g. `packs.test.ts` for changes under `data/packs/`).
2. Decide the assertion: it must be one the existing suite *couldn't* have caught before your change.
3. The code skill (phase 3) writes the failing test first, runs it, confirms it fails for the right reason, then makes the minimum edit to turn it green.

### Config / doc / data change → no test

No test. Phase 4 (Verify) still runs the existing suite to catch any regression. Don't pad the change with a placeholder test "to be safe" — placeholder tests grow stale and noisy.

## When unsure

Default to **code change**. The cost of writing a test for a trivial change is one extra tool call; the cost of skipping a test for a real change is a defect in production.

## What this skill does not do

- Does not write the test or the code. That's phase 3 (Code).
- Does not run tests. That's phase 4 (Verify).
- Does not commit. That's phase 5 (Submit).
- Does not consult `quiz-content-conventions` — that skill is auto-activated by the agent when relevant content is involved.
