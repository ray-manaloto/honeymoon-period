#!/usr/bin/env python3
"""Repair Cherri import-question indexes for Save Date Idea API."""

from __future__ import annotations

import plistlib
import sys
from pathlib import Path


EXPECTED_QUESTIONS = (
    "What is the full local capture endpoint URL?",
    "What participant API token should Save Date Idea API use?",
)


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

    expected = dict(zip(EXPECTED_QUESTIONS, trim_indexes, strict=True))
    questions = workflow.get("WFWorkflowImportQuestions", [])
    if {question.get("Text") for question in questions} != set(expected):
        raise RuntimeError("unexpected Save Date Idea API import questions")

    for question in questions:
        question["ActionIndex"] = expected[question["Text"]]
        question["ParameterKey"] = "WFInput"

    output_format = plistlib.FMT_BINARY if original.startswith(b"bplist") else plistlib.FMT_XML
    with plist_path.open("wb") as handle:
        plistlib.dump(workflow, handle, fmt=output_format, sort_keys=False)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(f"usage: {Path(sys.argv[0]).name} WORKFLOW.plist")
    main(sys.argv[1])
