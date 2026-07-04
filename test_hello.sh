#!/usr/bin/env bash
set -euo pipefail

# Test that HELLO-HARNESS.md exists, has at least one line, and is in the repo root
[ -f HELLO-HARNESS.md ] || { echo "FAIL: HELLO-HARNESS.md not found"; exit 1; }
lines=$(wc -l < HELLO-HARNESS.md)
[ "$lines" -ge 1 ] || { echo "FAIL: HELLO-HARNESS.md is empty"; exit 1; }
first_line=$(head -1 HELLO-HARNESS.md)
[ -n "$first_line" ] || { echo "FAIL: first line is empty"; exit 1; }
echo "PASS: HELLO-HARNESS.md exists with content: $first_line"
