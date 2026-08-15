#!/usr/bin/env bash
# Per-repo harness warm hook (same convention as PraxaAI/studio-ai's own harness-warm.sh) —
# the AgentCore harness runs `./harness-warm.sh <leased-env> <productCode>` from the repo root
# BEFORE the agent starts, if the repo ships this file. Best-effort by contract: never exits
# non-zero — a hiccup here must not abort the run before the agent is even invoked.
#
# Added to bench-verify #4102/#4103 (studio-ai's harness log-collect → S3 upload): studio-demo
# had no logs/*.log producer in its pre-loop warm, so buildLogCollectCommand had nothing to pick
# up on a docs-only bench task. This gives it one, mirroring the real thing studio-ai's own hook
# does (env resolve + a diagnostic line) rather than an artificial log for its own sake.
set -uo pipefail

ENV_NAME="${1:-}"
PRODUCT_CODE="${2:-}"
mkdir -p logs

{
	echo "WARM_STUDIO_DEMO rev=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
	echo "envName=${ENV_NAME:-<none>} productCode=${PRODUCT_CODE:-<none>}"
	echo "node=$(command -v node >/dev/null && node --version || echo none) pnpm=$(command -v pnpm >/dev/null && echo present || echo absent)"
} > logs/warm-studio-demo.log 2>&1

echo "WARM_STUDIO_DEMO_OK"
