# Agent Notes

This repo uses the studio-ai 5-phase SDLC: **Bootstrap → Plan → Code → Verify → Submit Candidate**. The platform prompt drives Submit Candidate end-to-end (commit, push, PR, submit_for_review). This file fills in the per-tenant *how* for phases 1–4. Read `ARCHITECTURE.md` for system layout and `VISION.md` for product intent before phase 2.

## Hard constraints

- **Static site.** `adapter-static` + `prerender = true` everywhere. No runtime server, no `+server.ts` endpoints, no server actions that depend on a live process. If a task needs dynamic behavior, surface it as a question — don't quietly add a backend.
- **All app commands run from `app/`.** The repo root has no `package.json`.
- **Node 22** (matches CI).
- **Do not deploy from the agent session.** `.github/workflows/preview.yml` posts a preview URL on the PR; `deploy.yml` ships `main` to GitHub Pages on merge. Both are automatic.

## 1. Bootstrap

From the repo root:

    cd app && npm ci

No env vars or secrets needed for local dev.

## 2. Plan

- Read `ARCHITECTURE.md` for project structure, data model, and the decisions table.
- Pack shape lives in `app/src/lib/packs.ts`; pack data in `app/src/lib/data/packs/*.json`.
- Read tests adjacent to files you'll edit (when they exist) — they encode constraints.

## 3. Code

- TypeScript + Svelte 5 runes mode. Prefer `$state` / `$derived` over legacy reactive syntax.
- Keep edits scoped to the task; no drive-by refactors.

## 4. Verify

From `app/`, in order:

1. `npm run check` — svelte-check + typecheck. **Must pass.**
2. `npm run build` — confirms the static adapter produces a valid build. **Must pass.**
3. `npm test` — vitest. The suite is empty today; if your change introduces non-trivial logic, add a vitest spec next to the code and make it pass.

Skip the dev server for verification — `npm run build` is the ground truth for a static site. If a task does need a running server, follow Dev Server Hygiene below.

## Dev Server Hygiene

Keep at most one local dev server running for this worktree.

- Before starting a dev server, check for existing listeners on the expected Vite ports:
  `lsof -nP -iTCP:5173 -sTCP:LISTEN`, `lsof -nP -iTCP:5174 -sTCP:LISTEN`, and
  `lsof -nP -iTCP:5175 -sTCP:LISTEN`.
- If a dev server is already running, reuse that URL instead of starting another one.
- If a fresh server is needed, stop the existing dev server first, then start the new one.
- Do not leave extra dev servers running after verification. Stop any server you started unless the user
  explicitly asks to keep it running.
