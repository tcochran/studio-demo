---
name: code
description: Make the change. Activate during phase 3 (Code) of the AI-Native SDLC, after Plan finishes and before Verify runs. Owns the per-tenant coding conventions for the Quiz Lab repo — how to branch, how to test-first, what edits look like.
---

# code

Quiz Lab's implementation step. Branch, test, edit. Keep it tight.

## Branch first

Create the PR branch before any edits. Branch name comes from the platform prompt:

```bash
git checkout -b <branchName> 2>&1 | tee /workspace/studio-demo/logs/git-checkout.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
```

If the checkout fails (`EXIT≠0`), stop. Do not start editing on `main`.

## Test-first when meaningful

For non-trivial changes, write the failing test first:

1. Pick the test file adjacent to the file you'll edit (e.g. `packs.test.ts` for changes under `data/packs/`).
2. Write a test that asserts the user-visible outcome from the spec.
3. Run the test once and confirm it fails for the right reason.
4. Then make the minimum edit to turn it green.

For trivial changes (one-character typo fix, single-value JSON edit), skip the test scaffolding — phase 4 (Verify) will catch it via the existing suite.

## Edit style

- Modify the original file. Never create `file_v2.json`, `file_new.ts`, or other suffixed variants.
- One file at a time, smallest viable edit.
- Don't refactor adjacent code.
- Don't add comments explaining the change ("added field X here" — that belongs in the commit message).

## Quiz-content changes

If you're adding or editing quiz questions, the `quiz-content-conventions` skill owns the content rules (voice, difficulty, validation shape). Consult it before deciding what to write.

## What this skill does not do

- Does not run the test suite. That's phase 4.
- Does not commit or push. That's phase 5.
- Does not open the PR. That's phase 5.
