#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h}
source_file="$repo_root/shortcut/Save Date Idea.cherri"
build_dir="$repo_root/.build"
dist_dir="$repo_root/dist"
cherri_dir="$build_dir/cherri"
cherri_bin="$build_dir/bin/cherri"
cherri_commit="68f3f3feaf00768f7943f650b2230605355936ed"

mkdir -p "$build_dir/bin" "$dist_dir"

if [[ ! -x "$cherri_bin" ]]; then
  rm -rf "$cherri_dir"
  git clone --quiet https://github.com/electrikmilk/cherri.git "$cherri_dir"
  git -C "$cherri_dir" checkout --quiet "$cherri_commit"
  (
    cd "$cherri_dir"
    go build -o "$cherri_bin" .
  )
fi

rm -f "$dist_dir/Save Date Idea.shortcut" "$build_dir/Save Date Idea.plist"

"$cherri_bin" "$source_file" \
  --debug \
  --share=anyone \
  --output="$dist_dir/Save Date Idea.shortcut"

# Cherri writes the debug plist beside the source. Preserve it only in .build so
# verification can inspect the unsigned workflow without committing generated XML.
unsigned_file="$repo_root/shortcut/Save Date Idea_unsigned.shortcut"
"$repo_root/scripts/fix-import-questions.py" "$unsigned_file"
cp "$unsigned_file" "$build_dir/Save Date Idea.plist"
/usr/bin/shortcuts sign \
  --mode anyone \
  --input "$unsigned_file" \
  --output "$dist_dir/Save Date Idea.shortcut"

rm -f \
  "$repo_root/shortcut/Save Date Idea.plist" \
  "$repo_root/shortcut/Save Date Idea_processed.cherri" \
  "$repo_root/shortcut/Save Date Idea_unsigned.shortcut"

print "Built: $dist_dir/Save Date Idea.shortcut"
