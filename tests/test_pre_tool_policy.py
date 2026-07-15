from __future__ import annotations

import importlib.util
from pathlib import Path
import unittest


MODULE_PATH = Path(__file__).parents[1] / ".codex" / "hooks" / "pre_tool_policy.py"
SPEC = importlib.util.spec_from_file_location("pre_tool_policy", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
POLICY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(POLICY)


class PreToolPolicyTests(unittest.TestCase):
    def test_blocks_destructive_git_commands(self) -> None:
        for command in (
            "git reset --hard HEAD",
            "git clean -fdx",
            "git push --force-with-lease origin main",
        ):
            with self.subTest(command=command):
                self.assertIsNotNone(POLICY.denial_reason(command))

    def test_blocks_device_and_distribution_commands(self) -> None:
        for command in (
            "xcrun devicectl list devices",
            "xcodebuild -scheme App archive",
            "xcodebuild -exportArchive -archivePath App.xcarchive",
            "xcrun notarytool submit App.zip",
            "fastlane pilot upload",
        ):
            with self.subTest(command=command):
                self.assertIsNotNone(POLICY.denial_reason(command))

    def test_blocks_only_unscoped_recursive_deletion(self) -> None:
        self.assertIsNotNone(POLICY.denial_reason("rm -rf /"))
        self.assertIsNotNone(POLICY.denial_reason("rm -rf ."))
        self.assertIsNone(POLICY.denial_reason('rm -rf "$repo_root/.build"'))

    def test_allows_normal_development_commands(self) -> None:
        for command in (
            "git status --short",
            "git clean -ndx",
            "xcodebuild test -scheme DateIdeas",
            "xcrun simctl list devices",
            "./scripts/verify.sh",
        ):
            with self.subTest(command=command):
                self.assertIsNone(POLICY.denial_reason(command))


if __name__ == "__main__":
    unittest.main()
