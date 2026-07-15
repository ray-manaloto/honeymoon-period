#!/bin/zsh
set -euo pipefail
repo_root=${0:A:h:h}

"$repo_root/scripts/build-shortcut.sh"
plutil -lint "$repo_root/.build/Save honeymoon-period.plist"
python3 "$repo_root/scripts/verify-shortcut.py" "$repo_root/.build/Save honeymoon-period.plist"

artifact="$repo_root/dist/Save honeymoon-period.shortcut"
[[ -s "$artifact" ]] || {
  print -u2 "Signed shortcut artifact is missing or empty: $artifact"
  exit 1
}

file "$artifact"
print "All shortcut checks passed."
