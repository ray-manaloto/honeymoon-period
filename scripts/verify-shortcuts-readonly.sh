#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h}
cherri_bin=${HONEYMOON_CHERRI_BIN:-"$repo_root/.build/bin/cherri"}
tool_dir=${HONEYMOON_SHORTCUT_TOOL_DIR:-"$repo_root/scripts"}
artifact_dir=${HONEYMOON_SHORTCUT_ARTIFACT_DIR:-"$repo_root/dist"}

if [[ ! -x "$cherri_bin" ]]; then
  print -u2 "Read-only Shortcut verification requires the pinned Cherri binary at $cherri_bin."
  print -u2 "Run a separately authorized build once, then retry this non-mutating check."
  exit 2
fi

scratch=$(mktemp -d "${TMPDIR:-/tmp}/honeymoon-shortcuts.XXXXXX")
trap 'rm -rf "$scratch"' EXIT

verify_source() {
  local source_name=$1
  local fixer=$2
  local verifier=$3
  local source="$scratch/$source_name.cherri"
  local output="$scratch/$source_name.shortcut"
  local plist="$scratch/$source_name.plist"

  cp "$repo_root/shortcut/$source_name.cherri" "$source" || return $?
  "$cherri_bin" "$source" --debug --share=anyone --output="$output" >/dev/null || return $?
  "$tool_dir/$fixer" "$plist" || return $?
  plutil -lint "$plist" || return $?
  PYTHONDONTWRITEBYTECODE=1 python3 "$tool_dir/$verifier" "$plist" || return $?
}

verify_source "Save honeymoon-period" "fix-import-questions.py" "verify-shortcut.py"
verify_source \
  "Save Date Idea API" \
  "fix-save-date-idea-import-questions.py" \
  "verify-save-date-idea-shortcut.py"

for artifact in \
  "$artifact_dir/Save honeymoon-period.shortcut" \
  "$artifact_dir/Save Date Idea API.shortcut"; do
  PYTHONDONTWRITEBYTECODE=1 python3 \
    "$repo_root/scripts/verify-signed-shortcut.py" \
    "$artifact"
done

print "Shortcut source structure and signed-artifact cryptographic envelopes passed read-only verification."
