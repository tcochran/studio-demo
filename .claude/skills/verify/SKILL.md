---
name: verify
description: Verify the Quiz Lab change works before submitting — runs build, type-check, and tests. Activate during phase 4 (Verify) of the AI-Native SDLC, after the implementation is finished and before the commit/push/PR/submit_for_review step. Owns the customer-specific verification commands that the platform prompt deliberately does not know about.
---

# verify

Quiz Lab's verification step. Runs from `app/` (the SvelteKit project root).

## Steps

Run each as its **own** `bash` tool call so a failure is diagnosable from its own log:

```bash
( cd /workspace/studio-demo/app && pnpm run build ) 2>&1 | tee /workspace/studio-demo/logs/build.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
( cd /workspace/studio-demo/app && pnpm run check ) 2>&1 | tee /workspace/studio-demo/logs/check.log | tail -5 ; echo "EXIT=${PIPESTATUS[0]}"
( cd /workspace/studio-demo/app && pnpm test -- --run ) 2>&1 | tee /workspace/studio-demo/logs/test.log | tail -10 ; echo "EXIT=${PIPESTATUS[0]}"
```

After each step, if `EXIT=N` prints with N≠0, **STOP IMMEDIATELY**: `tail -50 /workspace/studio-demo/logs/<that-step>.log` to gather context, post a single `create_comment` on the task describing the failure with the tail attached, then end your turn. Do NOT proceed to phase 5. Do NOT call `submit_for_review`.

## What this skill does not do

- Does not commit, push, or open the PR. That's phase 5 (Submit Candidate), owned by the platform's submit skill.
- Does not run customer-side deploys. Not part of verify for Quiz Lab.
