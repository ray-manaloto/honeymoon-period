#!/bin/zsh
set -euo pipefail
repo_root=${0:A:h:h}

"$repo_root/scripts/build-shortcut.sh"
plutil -lint "$repo_root/.build/Save Date Idea.plist"
python3 "$repo_root/scripts/verify-shortcut.py" "$repo_root/.build/Save Date Idea.plist"

artifact="$repo_root/dist/Save Date Idea.shortcut"
[[ -s "$artifact" ]] || {
  print -u2 "Signed shortcut artifact is missing or empty: $artifact"
  exit 1
}

file "$artifact"
print "All shortcut checks passed."
