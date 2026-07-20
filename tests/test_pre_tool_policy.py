from __future__ import annotations

import importlib.util
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone


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
            "xcodebuild test -scheme honeymoon-period",
            "xcrun simctl list devices",
            "./scripts/verify.sh",
        ):
            with self.subTest(command=command):
                self.assertIsNone(POLICY.denial_reason(command))

    def test_source_commit_requires_a_live_goal_lease(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.email", "fixture@example.invalid"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.name", "Fixture"], cwd=root, check=True)
            (root / "source.txt").write_text("one\n")
            subprocess.run(["git", "add", "source.txt"], cwd=root, check=True)
            subprocess.run(["git", "commit", "-qm", "fixture"], cwd=root, check=True)
            (root / "source.txt").write_text("two\n")
            subprocess.run(["git", "add", "source.txt"], cwd=root, check=True)

            goal_dir = root / ".codex/goals"
            lease_dir = goal_dir / ".lease"
            lease_dir.mkdir(parents=True)
            owner_token = "fixture-owner"
            now = datetime(2026, 7, 20, tzinfo=timezone.utc)
            owner = {
                "branch": POLICY.git_output(root, "branch", "--show-current"),
                "epoch": 1,
                "expiresAt": (now + timedelta(minutes=5)).isoformat(),
                "head": POLICY.git_output(root, "rev-parse", "HEAD"),
                "ownerToken": owner_token,
            }
            active = {
                "state": "running",
                "leaseEpoch": 1,
                "run": {"ownerTokenHash": hashlib.sha256(owner_token.encode()).hexdigest()},
            }
            (goal_dir / "active.json").write_text(json.dumps(active))
            (lease_dir / "owner.json").write_text(json.dumps(owner))

            self.assertIsNone(POLICY.active_goal_commit_denial("git commit -m source", root, now))
            self.assertIsNotNone(
                POLICY.active_goal_commit_denial(
                    "git commit -m source", root, now + timedelta(minutes=6)
                )
            )
            subdirectory = root / "nested"
            subdirectory.mkdir()
            self.assertEqual(
                POLICY.commit_repository("git commit -m source", subdirectory), root.resolve()
            )
            self.assertEqual(
                POLICY.commit_repository(f"git -C {root} commit -m source", subdirectory),
                root.resolve(),
            )
            self.assertIsNotNone(
                POLICY.denial_reason(
                    f"git -C {root} commit -m source", subdirectory
                )
            )
            (goal_dir / "active.json").write_text("{}")
            self.assertIsNotNone(
                POLICY.active_goal_commit_denial("git commit -m source", root, now)
            )

    def test_state_only_goal_commit_does_not_require_a_work_lease(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.email", "fixture@example.invalid"], cwd=root, check=True)
            subprocess.run(["git", "config", "user.name", "Fixture"], cwd=root, check=True)
            goal_dir = root / ".codex/goals"
            goal_dir.mkdir(parents=True)
            (goal_dir / "active.json").write_text('{"state":"ready"}\n')
            subprocess.run(["git", "add", ".codex/goals/active.json"], cwd=root, check=True)
            self.assertIsNone(POLICY.active_goal_commit_denial("git commit -m state", root))


if __name__ == "__main__":
    unittest.main()
