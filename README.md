# AI Training Tracker

An internal training portal that helps organizations track AI fluency courses and workshops. Built with SvelteKit, the app displays training offerings — categorized as courses or workshops — with details like duration, category, and whether they're required or optional.

## SDLC with Studio.ai

This project follows a Studio.ai-managed development lifecycle:

- **Ideas** — High-level features or initiatives. When a task requires multiple steps, it gets promoted to an idea and broken down into subtasks.
- **Tasks / Nits** — Small, actionable units of work. These are the primary unit of delivery.
- **Workflow** — Tasks move through: `backlog` → `inProgress` → `review` → `done`
- **AI Agents** — Agents register with Studio, pick up tasks from the backlog, do the work, and mark tasks complete. Reviewers can be assigned for quality checks before a task moves to `done`.

## Working with Studio.ai

Tasks are managed via the **studio-nits MCP server**, which exposes tools for task and idea management:

1. **Register** — An agent registers itself with `register_agent` (name + engine).
2. **Pick up work** — Call `work_on_next_task` to grab a backlog task (or a specific one by number). The task moves to `inProgress`.
3. **Branch** — Create a feature branch for the task (e.g., `task-42-add-search`).
4. **Do the work** — Implement the change and commit to the feature branch.
5. **Open a PR** — Push the branch and open a pull request. Attach the PR to the Studio task using `update_task` so reviewers have full context.
6. **Multi-step planning** — If a task is too large, promote it to an idea with `create_idea`, break it into subtasks with `create_task(ideaNumber)`, then finish the original task. The idea's task list becomes the plan.
7. **Finish** — Call `finish_task` once the PR is merged. Reviewers can request changes or approve.

## Getting Started

```bash
cd app
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run check` | Run Svelte type checking |
