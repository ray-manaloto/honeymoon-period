#!/usr/bin/env python3
"""Block a small set of commands that contradict repository policy."""

from __future__ import annotations

import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
import re
import subprocess
import sys
from typing import Any


POLICIES: tuple[tuple[re.Pattern[str], str], ...] = (
    (
        re.compile(r"\bgit\s+reset\s+--hard\b", re.IGNORECASE),
        "git reset --hard is prohibited; preserve existing worktree changes.",
    ),
    (
        re.compile(r"\bgit\s+clean\b[^\n]*(?:\s-f[\w-]*|\s--force\b)", re.IGNORECASE),
        "forced git clean is prohibited; remove only explicitly reviewed paths.",
    ),
    (
        re.compile(r"\bgit\s+push\b[^\n]*(?:\s-f\b|\s--force(?:-with-lease)?\b)", re.IGNORECASE),
        "force-pushing is prohibited by repository policy.",
    ),
    (
        re.compile(
            r"\brm\s+[^\n]*(?:-r[^\s]*f|-f[^\s]*r)[^\n]*"
            r"(?:\s/\s*$|\s~/?\s*$|\s\$HOME/?\s*$|\s\.\.?/?\s*$|\s\*\s*$)",
            re.IGNORECASE,
        ),
        "unscoped recursive deletion is prohibited; name a reviewed path inside the workspace.",
    ),
    (
        re.compile(r"\bxcrun\s+devicectl\b", re.IGNORECASE),
        "physical-device tooling is disabled while development is simulator-only.",
    ),
    (
        re.compile(r"\bxcodebuild\b[^\n]*(?:\barchive\b|-exportArchive\b)", re.IGNORECASE),
        "archive and distribution operations require explicit project authorization.",
    ),
    (
        re.compile(r"\bxcrun\s+(?:altool|notarytool|iTMSTransporter)\b", re.IGNORECASE),
        "upload, notarization, and distribution commands require explicit authorization.",
    ),
    (
        re.compile(r"\bfastlane\s+(?:pilot|deliver)\b", re.IGNORECASE),
        "TestFlight and App Store distribution require explicit authorization.",
    ),
)


def command_from(payload: dict[str, Any]) -> str:
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return ""
    command = tool_input.get("command")
    return command if isinstance(command, str) else ""


def git_output(root: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", *args], cwd=root, text=True, stderr=subprocess.DEVNULL
    ).strip()


def active_goal_commit_denial(
    command: str, root: Path, now: datetime | None = None
) -> str | None:
    if re.search(r"\bgit\s+commit\b", command, re.IGNORECASE) is None:
        return None
    try:
        staged = git_output(root, "diff", "--cached", "--name-only").splitlines()
    except (OSError, subprocess.CalledProcessError):
        return None
    state_paths = {".codex/goals/active.json", ".codex/goals/history.jsonl"}
    if staged and set(staged) <= state_paths:
        return None
    try:
        active = json.loads((root / ".codex/goals/active.json").read_text())
    except (OSError, json.JSONDecodeError):
        return None
    if active.get("state") == "complete":
        return None
    try:
        owner = json.loads((root / ".codex/goals/.lease/owner.json").read_text())
        renewal_path = root / ".codex/goals/.lease/renewal.json"
        renewal = json.loads(renewal_path.read_text()) if renewal_path.exists() else None
        effective_expiry = owner["expiresAt"]
        if (
            renewal
            and renewal.get("ownerToken") == owner.get("ownerToken")
            and renewal.get("epoch") == owner.get("epoch")
        ):
            effective_expiry = renewal["expiresAt"]
        expires_at = datetime.fromisoformat(effective_expiry.replace("Z", "+00:00"))
        current_time = now or datetime.now(timezone.utc)
        run = active["run"]
        valid = (
            active.get("state") == "running"
            and active.get("leaseEpoch") == owner.get("epoch")
            and hashlib.sha256(owner["ownerToken"].encode()).hexdigest()
            == run.get("ownerTokenHash")
            and expires_at > current_time
            and owner.get("branch") == git_output(root, "branch", "--show-current")
            and owner.get("head") == git_output(root, "rev-parse", "HEAD")
        )
    except (KeyError, OSError, ValueError, json.JSONDecodeError, subprocess.CalledProcessError):
        valid = False
    if valid:
        return None
    return (
        "a live Symphony goal lease is required before committing source; "
        "reconcile and obtain a new controller run first"
    )


def denial_reason(command: str, root: Path | None = None) -> str | None:
    for pattern, reason in POLICIES:
        if pattern.search(command):
            return reason
    if root is not None:
        return active_goal_commit_denial(command, root)
    return None


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 0

    if not isinstance(payload, dict) or payload.get("tool_name") != "Bash":
        return 0

    reason = denial_reason(command_from(payload), Path.cwd())
    if reason is None:
        return 0

    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        },
        sys.stdout,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
