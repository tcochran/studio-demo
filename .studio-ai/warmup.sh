#!/bin/bash
# Tenant warmup script for studio-demo (quiz-lab).
#
# Owned by THIS repo, invoked by studio-ai's self-hosted worker rebuilder
# after the worker host clones (or git-fetches) this repo into /workspace.
# The rebuilder runs:
#
#   git clone <this-repo> /workspace/<tenant-slug>  (or git fetch + reset)
#   bash /workspace/<tenant-slug>/.studio-ai/warmup.sh
#   systemctl restart ant-worker.service
#
# Goal: populate /workspace/<tenant-slug> with everything an agent session
# needs hot — node_modules, build cache, etc. — so the per-session Bootstrap
# phase has nothing to install.
#
# Idempotent: safe to re-run. Soft-reset (between agent sessions) is a
# re-run. Hard-rebuild (new EC2 from SST) is also a re-run on first boot.
#
# This script runs as ec2-user via systemd EnvironmentFile + WorkingDirectory
# already set by studio-ai's user-data. PATH already has /usr/local/bin/ant
# + system node.

set -e
# Stdout/stderr is captured by the caller (SSM Run Command). No file
# redirect needed — and `/var/log/` would fail anyway since this script
# runs as ec2-user, not root.
echo "[warmup] start $(date -u)"

# Enable pnpm via corepack (built into node 24, no extra install needed).
# `corepack enable pnpm` is idempotent.
corepack enable pnpm

# Workspace layout: this repo lives at /workspace/<tenant-slug>; the actual
# SvelteKit app is under `app/`. Match the studio-demo lockfile shape.
cd "$(dirname "$0")/.."
cd app

# Hot install. `--frozen-lockfile` rejects drift between package.json and
# pnpm-lock.yaml (treats lockfile as source of truth); `--prefer-offline`
# reuses cached tarballs when present.
echo "[warmup] pnpm install starting"
time pnpm install --frozen-lockfile --prefer-offline

echo "[warmup] node_modules ready: $(ls node_modules | wc -l) top-level entries"
echo "[warmup] done $(date -u)"
