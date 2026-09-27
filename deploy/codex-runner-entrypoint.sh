#!/bin/sh
set -eu

scratch_root=/run/coup-codex-scratch
mkdir -p "$scratch_root/work" "$scratch_root/runtime" "$scratch_root/tmp"
chmod 0700 "$scratch_root/work" "$scratch_root/runtime" "$scratch_root/tmp"
exec node /opt/coup-runner/server/ai/codex-worker.js
