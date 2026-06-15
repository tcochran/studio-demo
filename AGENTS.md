# Agent Notes

Per-tenant guidance for Quiz Lab. The platform prompt drives the 5-phase SDLC; this file fills in the *how* for phases 1–4. There are no phase skills — everything tenant-specific is here.

## Hard constraints

- **Static site.** `adapter-static` + `prerender = true` everywhere. No runtime server, no `+server.ts`, no server actions that depend on a live process. If a task needs dynamic behavior, surface it as a question — don't quietly add a backend.
- **Repo layout.** App source is in `app/`. Run `pnpm` from `/workspace/studio-demo/app`. Run `git` from `/workspace/studio-demo`.
- **pnpm**, not npm. Lockfile is `pnpm-lock.yaml`. Never run `npm ci` / `npm install` — they generate a stray `package-lock.json` and ignore the lockfile.
- **Node 22** (matches CI).
- **Do not deploy from the agent session.** `preview.yml` posts a preview URL on the PR; `deploy.yml` ships `main` to GitHub Pages on merge. Both automatic.

## Phase 1 — Bootstrap

Platform owns `mkdir -p logs` + git identity. Tenant deps:

```bash
( cd app && pnpm install --frozen-lockfile ) 2>&1 | tee logs/pnpm-install.log | tail -5
echo "EXIT=${PIPESTATUS[0]}"
```

On `EXIT≠0`: `tail -50 logs/pnpm-install.log`, post a `create_comment` with the tail, end the turn. Do not proceed.

## Phase 2 — Plan

Make exactly one decision before editing: **code change or config / doc / data change?**

- **Code change** — introduces user-visible behavior (new logic in `app/src/`, new route, bug fix with a reproducer). Test-first required.
- **Config / doc / data change** — README, AGENTS.md, comments, `package.json` metadata, `tsconfig.json`, static content not asserted on shape. No test required.

When unsure, default to code change.

Read `ARCHITECTURE.md` for project structure and the decisions table. Pack shape lives in `app/src/lib/packs.ts`; pack data in `app/src/lib/data/packs/*.json`. Read tests adjacent to files you'll edit — they encode constraints.

If editing quiz pack content, follow the `quiz-content-conventions` skill.

## Phase 3 — Code

- TypeScript + Svelte 5 runes mode. Prefer `$state` / `$derived` over legacy reactive syntax.
- Modify originals; never create `file_v2.json` / `file_new.ts` variants.
- One file at a time, smallest viable edit. Don't refactor adjacent code. Don't add comments explaining the change.

## Phase 4 — Verify

```bash
( cd /workspace/studio-demo/app && pnpm run check && pnpm run build && pnpm test -- --run ) 2>&1 | tee /workspace/studio-demo/logs/verify.log | tail -30
echo "EXIT=${PIPESTATUS[0]}"
```

On `EXIT≠0`: `tail -100 /workspace/studio-demo/logs/verify.log` to see which step failed, post a `create_comment` with the failure context, end the turn. Do not proceed.

`pnpm run build` is the ground truth for a static site. Skip the dev server for verification.
