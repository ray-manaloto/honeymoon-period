#!/bin/zsh
set -euo pipefail

repo_root=${0:A:h:h:h}
prototype_dir="$repo_root/prototype/sites-capture"
source_file="$prototype_dir/Send honeymoon-period.cherri"
build_dir="$repo_root/.build/prototype-sites-capture"
cherri_bin="$repo_root/.build/bin/cherri"
output="$build_dir/Send honeymoon-period.shortcut"
generated_name="Send honeymoon-period (Prototype)"

if [[ ! -x "$cherri_bin" ]]; then
  "$repo_root/scripts/build-shortcut.sh" >/dev/null
fi

mkdir -p "$build_dir"
rm -f "$output"

"$cherri_bin" "$source_file" \
  --debug \
  --share=anyone \
  --output="$output"

unsigned_file="$prototype_dir/${generated_name}_unsigned.shortcut"
"$prototype_dir/fix-import-questions.py" "$unsigned_file"
cp "$unsigned_file" "$build_dir/Send honeymoon-period.plist"
/usr/bin/shortcuts sign \
  --mode anyone \
  --input "$unsigned_file" \
  --output "$output"

rm -f \
  "$prototype_dir/${generated_name}.plist" \
  "$prototype_dir/Send honeymoon-period_processed.cherri" \
  "$unsigned_file"

print "Built prototype: $output"
