#!/bin/zsh
set -euo pipefail

if (( $# < 1 )); then
  print -u2 "usage: scripts/semantic-search.sh PATTERN [PATH ...]"
  exit 2
fi

pattern=$1
shift
search_paths=("${@:-.}")

rg --line-number --hidden \
  --glob '!node_modules/**' \
  --glob '!.git/**' \
  --glob '!.build/**' \
  --glob '!coverage/**' \
  --glob '!playwright-report/**' \
  --glob '!test-results/**' \
  --glob '!**/dist/**' \
  --glob '!packages/generated/src/validators.ts' \
  "$pattern" "${search_paths[@]}"
