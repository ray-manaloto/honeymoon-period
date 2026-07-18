#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h}
plist="$repo_root/.build/save-date-idea/Save Date Idea API.plist"
artifact="$repo_root/dist/Save Date Idea API.shortcut"

"$repo_root/scripts/build-save-date-idea-shortcut.sh"
plutil -lint "$plist"
PYTHONDONTWRITEBYTECODE=1 python3 \
  "$repo_root/scripts/verify-save-date-idea-shortcut.py" \
  "$plist"

[[ -s "$artifact" ]] || {
  print -u2 "Signed shortcut artifact is missing or empty: $artifact"
  exit 1
}

file "$artifact"
print "All Save Date Idea API checks passed."
