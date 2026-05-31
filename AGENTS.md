# Agent Notes

## Dev Server Hygiene

Keep at most one local dev server running for this worktree.

- Before starting a dev server, check for existing listeners on the expected Vite ports:
  `lsof -nP -iTCP:5173 -sTCP:LISTEN`, `lsof -nP -iTCP:5174 -sTCP:LISTEN`, and
  `lsof -nP -iTCP:5175 -sTCP:LISTEN`.
- If a dev server is already running, reuse that URL instead of starting another one.
- If a fresh server is needed, stop the existing dev server first, then start the new one.
- Do not leave extra dev servers running after verification. Stop any server you started unless the user
  explicitly asks to keep it running.
