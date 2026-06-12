---
name: code
description: Make the change. Activate during phase 3 (Code) of the AI-Native SDLC, after Plan finishes and before Verify runs. Owns the per-tenant *mechanics* for the Quiz Lab repo — how to branch, edit style, what NOT to do. The judgment of test-first-or-not lives in the `plan` skill and was decided in phase 2.
---

# code

Quiz Lab's implementation step. Plan (phase 2) already decided whether to test-first; this skill owns the mechanics regardless of that decision.

## Branch first

Create the PR branch before any edits. Branch name comes from the platform prompt:

```bash
git checkout -b <branchName> 2>&1 | tee /workspace/studio-demo/logs/git-checkout.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
```

If the checkout fails (`EXIT≠0`), stop. Do not start editing on `main`.

## Execute the plan

### Plan decided code change → test-first

1. Write the failing test the plan skill committed to.
2. Run it. Confirm it fails for the right reason (not a typo, not a missing fixture — actually because the new behavior doesn't exist yet).
3. Make the minimum edit to turn it green.

### Plan decided config / doc / data change

Skip the test scaffolding. Make the edit directly.

## Edit style (regardless of plan decision)

- Modify the original file. Never create `file_v2.json`, `file_new.ts`, or other suffixed variants.
- One file at a time, smallest viable edit.
- Don't refactor adjacent code.
- Don't add comments explaining the change ("added field X here" — that belongs in the commit message).

## Quiz-content changes

If you're adding or editing quiz questions, consult the `quiz-content-conventions` skill — it owns the content rules (voice, difficulty, validation shape) separately from the SDLC mechanics here.

## What this skill does not do

- Does not decide whether to test-first. That's the `plan` skill (phase 2).
- Does not run the test suite or the broader verification ladder. That's phase 4 (Verify).
- Does not commit, push, or open the PR. That's phase 5 (Submit).
