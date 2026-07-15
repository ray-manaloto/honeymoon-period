#!/usr/bin/env python3
"""Repair Cherri import-question action indexes before final signing."""

from __future__ import annotations

import plistlib
import sys
from pathlib import Path


def one_index(actions: list[dict], identifier: str) -> int:
    matches = [
        index
        for index, action in enumerate(actions)
        if action.get("WFWorkflowActionIdentifier") == identifier
    ]
    if len(matches) != 1:
        raise RuntimeError(f"expected one {identifier} action, found {len(matches)}")
    return matches[0]


def last_index(actions: list[dict], identifier: str) -> int:
    matches = [
        index
        for index, action in enumerate(actions)
        if action.get("WFWorkflowActionIdentifier") == identifier
    ]
    if not matches:
        raise RuntimeError(f"expected at least one {identifier} action")
    return matches[-1]


def main(path: str) -> None:
    plist_path = Path(path)
    original = plist_path.read_bytes()
    with plist_path.open("rb") as handle:
        workflow = plistlib.load(handle)

    actions = workflow["WFWorkflowActions"]
    workflow.setdefault("WFWorkflowNoInputBehavior", {})["Parameters"] = {}
    # Title fallback may also trim user input. The Added By import question is
    # intentionally attached to the final trim action immediately before notes.
    added_by_index = last_index(actions, "is.workflow.actions.text.trimwhitespace")
    reminder_index = one_index(actions, "is.workflow.actions.addnewreminder")

    for question in workflow.get("WFWorkflowImportQuestions", []):
        prompt = question.get("Text", "")
        if prompt.startswith("What name should appear"):
            question["ActionIndex"] = added_by_index
            question["ParameterKey"] = "WFInput"
        elif prompt.startswith("Which Reminders list"):
            question["ActionIndex"] = reminder_index
            question["ParameterKey"] = "WFCalendarDescriptor"

    with plist_path.open("wb") as handle:
        output_format = plistlib.FMT_BINARY if original.startswith(b"bplist") else plistlib.FMT_XML
        plistlib.dump(workflow, handle, fmt=output_format, sort_keys=False)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(f"usage: {Path(sys.argv[0]).name} WORKFLOW.plist")
    main(sys.argv[1])
