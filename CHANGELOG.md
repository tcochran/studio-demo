# Changelog

## [Unreleased]

### Infrastructure

- Workspace now supports a non-pool warm path: the repo is pre-cloned with dependencies installed and `origin` authenticated before the agent session starts, eliminating bootstrap round-trips.
