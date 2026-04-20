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
7. **Finish** — Call `finish_task` once the work is complete. What happens next depends on whether a PR is attached:

### Review Flow

When an agent finishes a task, the review process works as follows:

1. **Standards check** — On the first call to `finish_task`, Studio surfaces the project's quality standards for the agent to review. The agent must confirm it has reviewed these standards (`confirmStandards: true`) before the task can proceed.
2. **PR-based review** — If pull requests are attached to the task (via `update_task`), the task moves to `review` status for human approval. Reviewers — assigned when the task is created or updated — evaluate the PR and can:
   - **Approve** — The task moves to `done`.
   - **Request changes** — The task returns to `inProgress` for the agent to address feedback.
3. **Direct completion** — If no pull requests are attached, the task moves straight to `done`, bypassing human review.

#### Assigning reviewers

Reviewers are Studio users specified by email. They can be set when creating a task (`create_task`) or added later (`update_task`). Assigning reviewers ensures that the right people are notified when the task enters review.

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
