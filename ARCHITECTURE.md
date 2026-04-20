# Architecture

High-level architecture overview for the AI Training Tracker.

## Overview

AI Training Tracker is an internal training portal built with SvelteKit that helps organizations track AI fluency courses and workshops. It serves as a single source of truth for AI training status across teams.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 + Svelte 5 (Runes mode) |
| Language | TypeScript (strict mode) |
| Build | Vite 8 |
| Deployment | SvelteKit adapter-auto |
| Task Management | Studio.ai MCP Server (studio-nits) |

## Project Structure

```
studio-demo/
├── app/                        # SvelteKit application
│   ├── src/
│   │   ├── routes/             # Pages and server loaders
│   │   │   ├── +layout.svelte  # Root layout
│   │   │   ├── +page.svelte    # Home page (training list)
│   │   │   └── +page.server.ts # Server-side data loading
│   │   └── lib/
│   │       ├── data/           # Static data (trainings.json)
│   │       └── assets/         # Favicon and static assets
│   ├── static/                 # Public static files
│   ├── svelte.config.js        # Svelte configuration
│   └── vite.config.ts          # Vite configuration
├── .mcp.json                   # MCP server configuration
├── planning/                   # Planning documents
├── strategy/                   # Strategy documents
└── customer-research/          # Customer feedback and research
```

## Data Flow

```
Browser Request
      │
      ▼
SvelteKit Router
      │
      ▼
+page.server.ts ── reads ──▶ trainings.json
      │
      ▼
+page.svelte (receives data via $props())
      │
      ▼
Renders courses & workshops to browser
```

There is no backend API layer or database. Training data is stored as static JSON and loaded server-side via Node.js `fs` at request time.

## Data Model

Training entries contain:

- **id** — Unique identifier
- **title** — Training name
- **category** — Fundamentals, Engineering, Product, or Business
- **type** — `course` or `workshop`
- **duration** — Length (e.g., "60 min", "3 hrs")
- **required** — Boolean (required vs. optional)
- **description** — Training description

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Static JSON over database | MVP simplicity; sufficient for current catalog size |
| Server-side data loading | Leverages SvelteKit's `load()` for SSR; no client-side fetch needed |
| Svelte Runes mode | Enforced in config for modern, type-safe reactivity |
| No component library | Scoped CSS in Svelte components; minimal UI complexity |
| adapter-auto | Flexible deployment to Vercel, Node.js, or static hosting |

## External Integrations

### Studio.ai (studio-nits MCP Server)

Used for AI agent-driven task management:

- Agents register, pick up tasks, create feature branches, and open PRs
- Workflow: **Backlog → In Progress → Review → Done**
- Configured in `.mcp.json` with org, studio, and product codes

## Future Considerations

As the project grows beyond MVP, likely additions include:

- Database backend (replacing static JSON)
- User authentication and enrollment tracking
- Search and filtering API
- Admin dashboard for content management
- Reusable UI component library
