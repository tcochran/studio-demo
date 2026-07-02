# Pi Lifecycle

Pi manages tasks through a three-state lifecycle: **backlog → inProgress → review**. This document describes how these states work in this project.

## States

| State | Description |
|-------|-------------|
| **backlog** | Task exists in the issue tracker but has not yet been picked up by Pi. The task may reference an issue number (e.g., `#1998`). |
| **inProgress** | Pi is actively working on the task. This state begins when Pi starts the 5-phase SDLC (Bootstrap → Plan → Code → Verify → Submit). |
| **review** | Pi has completed the implementation and opened a Pull Request. The PR links back to the task and is ready for human review. |

## Transitions

```
backlog ──(assign)──→ inProgress ──(PR)──→ review
```

1. **backlog → inProgress**: Pi picks up the task from the issue tracker, creates a feature branch, and begins the implementation.
2. **inProgress → review**: Pi completes the 5-phase SDLC, commits the changes, pushes the branch, and opens a Pull Request with task metadata.

## Task metadata

Each task carries a unique timestamp (e.g., `1783009743281`) and an optional reference issue (e.g., `#1998 test`). The PR body records these identifiers so the lifecycle can be traced end-to-end.

## Purpose

This lifecycle ensures every change in the project is traceable from issue to merged PR. It is the foundation of the studio-ai idea-to-production workflow demonstrated by Quiz Lab.
