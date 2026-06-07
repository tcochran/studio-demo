---
name: submit-candidate
description: Submit the release candidate. Activate during phase 5 (Submit Candidate) of the AI-Native SDLC, after Verify finishes successfully. Owns the per-tenant submission flow for the Quiz Lab repo — commit, push, PR, submit_for_review, DONE.
---

# submit-candidate

Quiz Lab's submission flow. Verification (phase 4) has already run — do not re-run tests here.

## Steps

Run as a single bash call (these always run together and a failure on any step aborts the rest):

```bash
git add -A && git commit -m "<taskNumber>: <taskName>" && git push -u origin <branchName> ; echo "EXIT=$?"
```

The platform prompt supplies the concrete `taskNumber`, `taskName`, and `branchName` values — use them verbatim.

If `EXIT≠0`, stop. Tail the git output to see why (`git status`, `git log -1`). Post a `create_comment` on the task with the failure detail. Do NOT call `create_pull_request` or `submit_for_review`.

## Open the PR

Use the **github** MCP `create_pull_request` tool. The `gh` CLI is **not** authenticated in this environment — do not shell out to it.

Required fields from the platform prompt:

- `owner` / `repo` — from the values in the prompt
- `head` — the branch you just pushed
- `base` — `main`
- `title` — `<taskNumber>: <taskName>`
- `body` — a one-paragraph summary of what changed and why

Record the `html_url` and `number` from the response.

## Submit for review

Use the **studio-ai** MCP `submit_for_review` tool. Call it once with:

- `productCode`, `taskNumber`, `agentName` — from the prompt values
- `confirmStandards: true`
- `pullRequests: [{ repoOwner, repoName, prNumber, url, status: "open" }]`

## Finish

Print the full PR URL on its own line, then output `DONE`. That's it. No summary, no recap.

## What this skill does not do

- Does not run tests. That's phase 4.
- Does not deploy. Quiz Lab deploys on merge to main via GitHub Pages; deploy is automatic.
- Does not write a build report. The platform handles end-of-run reporting on the task.
