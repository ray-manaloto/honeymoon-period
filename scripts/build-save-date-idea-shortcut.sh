#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h}
source_file="$repo_root/shortcut/Save Date Idea API.cherri"
build_dir="$repo_root/.build/save-date-idea"
dist_dir="$repo_root/dist"
cherri_bin="$repo_root/.build/bin/cherri"
output="$dist_dir/Save Date Idea API.shortcut"
generated_name="Save Date Idea API"

if [[ ! -x "$cherri_bin" ]]; then
  "$repo_root/scripts/build-shortcut.sh" >/dev/null
fi

mkdir -p "$build_dir" "$dist_dir"
rm -f "$output" "$build_dir/Save Date Idea API.plist"

"$cherri_bin" "$source_file" \
  --debug \
  --share=anyone \
  --output="$output"

unsigned_file="$repo_root/shortcut/${generated_name}_unsigned.shortcut"
"$repo_root/scripts/fix-save-date-idea-import-questions.py" "$unsigned_file"
cp "$unsigned_file" "$build_dir/Save Date Idea API.plist"
/usr/bin/shortcuts sign \
  --mode anyone \
  --input "$unsigned_file" \
  --output "$output"

rm -f \
  "$repo_root/shortcut/${generated_name}.plist" \
  "$repo_root/shortcut/${generated_name}_processed.cherri" \
  "$unsigned_file"

print "Built: $output"
