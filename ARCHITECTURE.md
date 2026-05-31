# Architecture

High-level overview of Quiz Lab.

## Overview

Quiz Lab is a static SvelteKit app. Trivia packs live as JSON files in the repo. Adding a pack is editing a file and opening a PR — that's the whole content workflow on day one.

There is intentionally no backend in v1. Scores, leaderboards, and feedback persistence are tracked as future ideas in studio-ai and will land as additive layers (likely against the existing `agent-api` AppSync + DynamoDB stack).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 + Svelte 5 (runes mode) |
| Language | TypeScript (strict) |
| Build | Vite 8 |
| Deployment | `@sveltejs/adapter-static` → GitHub Pages |
| Tests | Vitest |
| Task management | studio-ai MCP server (`.mcp.json`) |

## Project Structure

```
product-demo-template/
├── app/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +layout.svelte         # Top nav + global styling
│   │   │   ├── +layout.ts             # prerender = true
│   │   │   ├── +page.svelte           # Pack picker (home)
│   │   │   ├── +page.server.ts        # Loads all packs
│   │   │   └── play/[pack]/
│   │   │       ├── +page.svelte       # Play screen
│   │   │       └── +page.server.ts    # Loads one pack
│   │   └── lib/
│   │       ├── packs.ts               # Pack loader + types
│   │       └── data/packs/            # One JSON file per pack
│   │           ├── premier-league.json
│   │           └── nyt-easy.json
│   ├── svelte.config.js
│   └── vite.config.ts
├── .github/workflows/                 # GitHub Pages deploy + PR preview
├── .mcp.json                          # studio-ai MCP wiring
├── README.md
└── VISION.md
```

## Data Flow

```
Browser → SvelteKit router → +page.server.ts → packs.ts → JSON files on disk
                                                            │
                                                            ▼
                                              +page.svelte renders pack list / play screen
```

Everything is prerendered at build time (`adapter-static` + `prerender = true`), so there is no server runtime. The app deploys to GitHub Pages as static files.

## Data Model

A pack:

```ts
{
  id: string;            // URL slug, e.g. "premier-league"
  title: string;         // "Premier League Trivia"
  category: string;      // "Sports", "Word play", etc.
  description: string;   // One-liner shown on pack card
  questions: Question[]; // ordered, played in sequence
}
```

A question:

```ts
{
  id: string;             // unique within the pack
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  difficulty: 1 | 2 | 3;  // 1 = easy, 3 = hard
  explanation: string;    // shown after answering
}
```

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Static JSON for packs (no DB) | A pack edit is one file change + one PR — keeps the demo loop tight |
| `adapter-static` + GitHub Pages | Free hosting, no infra to manage, PR previews come for free |
| Svelte 5 runes mode enforced | Modern reactivity, type-safe, matches studio-ai monorepo conventions |
| One pack = one file | Trivially parallelizable: multiple agents can author packs without merge conflicts |
| No scoring persistence in v1 | Scoped out intentionally; future idea in studio-ai |
