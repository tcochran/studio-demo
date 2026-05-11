# AI Training Tracker

An internal training portal that helps organizations track AI fluency courses and workshops. Built with SvelteKit, the app displays training offerings — categorized as courses or workshops — with details like duration, category, and whether they're required or optional.

## Getting Started

```bash
cd app
npm install
npm run dev
```

## Getting Started with Studio AI

This repo is wired up to **Studio AI** for task and idea management. Once configured, Claude Code can create tasks, work them, open PRs, and close them out — all through the Studio AI MCP server.

### 1. Get an API token

Ask a Studio AI platform admin to mint you a token. This repo's studio is `demo-alpha-studio` (org `demo-alpha`). You'll get back a string starting with `eyJhbGciOiJIUzI1NiIs...`.

### 2. Configure Claude Code

Create `.claude/settings.local.json` in this repo (gitignored — lives only on your machine):

```json
{
  "env": {
    "STUDIO_API_KEY": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

That's it. The committed `.mcp.json` already references `${STUDIO_API_KEY}` and points at the hosted MCP endpoint — no further setup.

### 3. Launch Claude Code

```bash
claude
```

Confirm it works:

> "What tasks are on my plate in Studio AI?"

You should see results from `demo-alpha-studio`.

### Common asks

- "Create a task for adding search to the training catalog"
- "What are my in-progress tasks?"
- "Pick up the next task in the backlog"

The full workflow is **Backlog → In Progress → Review → Done**, driven by Claude opening a PR and a reviewer approving on GitHub.

## Team

- **Tim Cochran** — Engineer
- **Cassie Shum** — Product Manager
