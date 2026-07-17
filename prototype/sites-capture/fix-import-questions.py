#!/usr/bin/env python3
"""Repair Cherri import-question indexes for the Shortcut prototype."""

from __future__ import annotations

import plistlib
import sys
from pathlib import Path


def main(path: str) -> None:
    plist_path = Path(path)
    original = plist_path.read_bytes()
    with plist_path.open("rb") as handle:
        workflow = plistlib.load(handle)

    trim_indexes = [
        index
        for index, action in enumerate(workflow["WFWorkflowActions"])
        if action.get("WFWorkflowActionIdentifier")
        == "is.workflow.actions.text.trimwhitespace"
    ]
    if len(trim_indexes) != 2:
        raise RuntimeError(f"expected two trim actions, found {len(trim_indexes)}")

    expected = {
        "What is the full capture endpoint URL?": trim_indexes[0],
        "What participant API token should this prototype use?": trim_indexes[1],
    }
    questions = workflow.get("WFWorkflowImportQuestions", [])
    if {question.get("Text") for question in questions} != set(expected):
        raise RuntimeError("unexpected prototype import questions")

    for question in questions:
        question["ActionIndex"] = expected[question["Text"]]
        question["ParameterKey"] = "WFInput"

    with plist_path.open("wb") as handle:
        output_format = plistlib.FMT_BINARY if original.startswith(b"bplist") else plistlib.FMT_XML
        plistlib.dump(workflow, handle, fmt=output_format, sort_keys=False)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(f"usage: {Path(sys.argv[0]).name} WORKFLOW.plist")
    main(sys.argv[1])
