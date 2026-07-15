#!/usr/bin/env python3
"""Structural checks for the generated Save Date Idea shortcut plist."""

from __future__ import annotations

import plistlib
import sys
from pathlib import Path


REQUIRED_ACTIONS = {
    "is.workflow.actions.detect.link",
    "is.workflow.actions.count",
    "is.workflow.actions.getitemfromlist",
    "is.workflow.actions.url.expand",
    "is.workflow.actions.urlencode",
    "is.workflow.actions.ask",
    "is.workflow.actions.text.replace",
    "is.workflow.actions.geturlcomponent",
    "is.workflow.actions.getitemname",
    "is.workflow.actions.spotlightsearch",
    "is.workflow.actions.addnewreminder",
    "is.workflow.actions.notification",
}


def fail(message: str) -> None:
    raise AssertionError(message)


def main(path: str) -> int:
    plist_path = Path(path)
    if not plist_path.is_file():
        fail(f"missing generated plist: {plist_path}")

    with plist_path.open("rb") as handle:
        workflow = plistlib.load(handle)

    actions = workflow.get("WFWorkflowActions", [])
    identifiers = {action.get("WFWorkflowActionIdentifier") for action in actions}
    missing = REQUIRED_ACTIONS - identifiers
    if missing:
        fail(f"missing required actions: {sorted(missing)}")

    conditional_starts = []
    conditional_ends = []
    for action in actions:
        if action.get("WFWorkflowActionIdentifier") != "is.workflow.actions.conditional":
            continue
        params = action.get("WFWorkflowActionParameters", {})
        if params.get("WFControlFlowMode") == 0:
            conditional_starts.append(params.get("GroupingIdentifier"))
        elif params.get("WFControlFlowMode") == 2:
            conditional_ends.append(params.get("GroupingIdentifier"))
    if None in conditional_starts or len(conditional_starts) != len(set(conditional_starts)):
        fail("conditional blocks do not have unique grouping identifiers")
    if sorted(conditional_starts) != sorted(conditional_ends):
        fail("conditional blocks do not have matching start and end actions")

    if "ActionExtension" not in workflow.get("WFWorkflowTypes", []):
        fail("shortcut is not enabled for the Share Sheet")

    input_classes = set(workflow.get("WFWorkflowInputContentItemClasses", []))
    required_inputs = {"WFURLContentItem", "WFStringContentItem"}
    if not required_inputs.issubset(input_classes):
        fail(f"missing required input classes: {sorted(required_inputs - input_classes)}")

    add_actions = [
        action
        for action in actions
        if action.get("WFWorkflowActionIdentifier") == "is.workflow.actions.addnewreminder"
    ]
    if len(add_actions) != 1:
        fail(f"expected one Add New Reminder action, found {len(add_actions)}")

    add_params = add_actions[0].get("WFWorkflowActionParameters", {})
    for key in (
        "WFCalendarItemTitle",
        "WFCalendarDescriptor",
        "WFCalendarItemNotes",
        "WFURL",
    ):
        if key not in add_params:
            fail(f"Add New Reminder is missing {key}")

    no_input = workflow.get("WFWorkflowNoInputBehavior", {})
    if no_input.get("Name") != "WFWorkflowNoInputBehaviorGetClipboard":
        fail("shortcut does not use the clipboard when run without input")
    if "Parameters" not in no_input:
        fail("clipboard no-input behavior is missing its Parameters dictionary")

    questions = workflow.get("WFWorkflowImportQuestions", [])
    question_keys = {question.get("ParameterKey") for question in questions}
    if "WFCalendarDescriptor" not in question_keys:
        fail("missing import question for the destination Reminders list")

    action_indexes = {
        action.get("WFWorkflowActionIdentifier"): index
        for index, action in enumerate(actions)
    }
    expected_questions = {
        "WFInput": action_indexes["is.workflow.actions.text.trimwhitespace"],
        "WFCalendarDescriptor": action_indexes["is.workflow.actions.addnewreminder"],
    }
    for parameter_key, action_index in expected_questions.items():
        matches = [q for q in questions if q.get("ParameterKey") == parameter_key]
        if len(matches) != 1 or matches[0].get("ActionIndex") != action_index:
            fail(f"import question {parameter_key} points at the wrong action")

    encoded = plist_path.read_bytes()
    for marker in (b"Date Idea URL:", b"Source:", b"Added by:", b"Notes: Add what looks good"):
        if marker not in encoded:
            fail(f"missing reminder note marker: {marker.decode()}")

    print(f"Verified {len(actions)} actions in {plist_path}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} WORKFLOW.plist", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
