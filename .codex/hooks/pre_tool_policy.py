#!/usr/bin/env python3
"""Block a small set of commands that contradict repository policy."""

from __future__ import annotations

import json
import re
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


def denial_reason(command: str) -> str | None:
    for pattern, reason in POLICIES:
        if pattern.search(command):
            return reason
    return None


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 0

    if not isinstance(payload, dict) or payload.get("tool_name") != "Bash":
        return 0

    reason = denial_reason(command_from(payload))
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
