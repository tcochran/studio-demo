---
name: plan
description: Plan the change before writing code. Activate during phase 2 (Plan) of the AI-Native SDLC, after Bootstrap finishes and before any file edits. Owns the per-tenant planning conventions for the Quiz Lab repo — what to read first, how to scope the change, what shape the implementation takes.
---

# plan

Quiz Lab's planning step. The output isn't a written plan document — it's the mental model you carry into Code (phase 3).

## What to read before planning

In order, lightest to heaviest:

1. The task spec (already inlined in the system prompt).
2. The README and ARCHITECTURE.md at the repo root — they describe the project shape and decisions made.
3. The file(s) the spec implies you'll touch — read the file *and* the test file next to it (when one exists). Tests encode constraints you can satisfy on the first attempt.
4. The `quiz-content-conventions` skill if the change touches quiz packs or questions.

Don't read speculatively. If the spec says "add a question to british-music.json", you don't need to read all the other pack files first.

## Scope discipline

- One concrete change per task. If the spec implies multiple changes, stop and post a `create_comment` asking which to do first.
- No drive-by refactors. If you see something untidy adjacent to your edit, leave it.
- Minimal changes win. A one-line edit that satisfies the spec beats a multi-file restructure that's "better" but unscoped.

## Shape of the change

Decide before writing code:

- Which file(s) you'll edit.
- Whether you'll add a test (default yes; phase 3 owns the test).
- The smallest edit that satisfies the spec's user-visible outcome.

## What this skill does not do

- Does not write the code. That's phase 3.
- Does not write a planning document or post a plan comment unless explicitly asked.
- Does not run tests. That's phase 4.
