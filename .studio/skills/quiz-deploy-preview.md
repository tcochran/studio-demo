---
name: quiz-deploy-preview
description: Deploy a preview environment for the studio-demo quiz app. Activate when the task asks to "deploy a preview", "preview the quiz", "preview the latest quiz changes", or any request for a temporary deployable URL showing pending quiz changes. The platform agent should follow these steps instead of guessing deploy commands.
---

# quiz-deploy-preview

How to deploy a preview environment for the quiz app in this repo. Customer-owned guidance — the studio-ai platform cannot know our deploy flow.

## When to activate

A task says some variant of:

- "Deploy a preview of the latest quiz changes"
- "Preview the quiz changes"
- "Get me a URL so I can see the quiz before merging"
- "Ship a preview / dev / staging build of the quiz"

If the task is **production** deploy or **merge-and-release**, this skill does not apply — use the production release flow instead (separate skill, TODO).

## What the preview deploy actually does

The quiz lives in `app/` (Next.js). Each push to a branch gets its own Vercel preview URL automatically — we do not run a manual `vercel deploy` from the agent.

So "deploy a preview" in this repo means:

1. Make sure the branch is pushed to origin.
2. Read back the Vercel preview URL the integration assigns.
3. Surface that URL to the requester.

## Steps

1. **Confirm the branch is pushed.** From the repo root: `git push -u origin <current-branch>`. If the branch already exists on origin and there are unpushed commits, do a normal `git push`.

2. **Wait for the Vercel preview to be assigned.** The Vercel GitHub integration posts a check-run on the commit. Poll the GitHub commit checks for one named `Vercel` or `vercel`:

   ```
   gh api repos/{owner}/{repo}/commits/<sha>/check-runs | jq '.check_runs[] | select(.name | test("vercel"; "i"))'
   ```

   Look for `details_url` once the check moves to `in_progress` or `completed`. The `details_url` redirects to the deployed preview URL. Allow ~30–60s after push for the check to appear.

3. **Verify the preview is reachable.** `curl -sI <preview-url>` should return a 2xx or 3xx. A 404 means the build is still in progress; wait and retry.

4. **Report.** Surface the preview URL to the task as a comment. Format: `Preview: <url>`. Include the commit SHA so the requester knows which changes are reflected.

## Common gotchas

- **`app/` subdirectory.** Vercel is configured to build from `app/`. Commands like `npm ci` must run there (`cd app && npm ci`); git commands stay at the repo root.
- **Stale preview cache.** If a previously deployed URL for the same branch shows old content, the deploy may still be running — re-check the GitHub check-run's `conclusion` field; only `success` means it's live.
- **No preview without a PR (sometimes).** Vercel can be configured to skip preview builds for non-PR branches. If no Vercel check appears after 2 minutes and the branch has commits ahead of `main`, open a draft PR — the preview will fire on PR open.

## Out of scope

- Provisioning a brand-new Vercel project (the project already exists; we use the integration that's wired up).
- Production deploys (`main` only).
- Custom domains.
