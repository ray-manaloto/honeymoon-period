#!/usr/bin/env python3
"""Structural contract checks for the generated Save Date Idea API shortcut."""

from __future__ import annotations

import plistlib
import sys
from pathlib import Path
from typing import Any


REQUIRED_INPUTS = {
    "WFURLContentItem",
    "WFStringContentItem",
    "WFRichTextContentItem",
    "WFSafariWebPageContentItem",
}
EXPECTED_QUESTIONS = {
    "What is the full local capture endpoint URL?",
    "What participant API token should Save Date Idea API use?",
}
EXPECTED_DEFAULTS = {
    "http://replace-with-mac-ip:8788/v1/captures",
    "replace-with-participant-token",
}
SUCCESS_STATUSES = {"created", "existing", "replayed"}
SUCCESS_FEEDBACK = {
    "created": "Saved a new date idea.",
    "existing": "Added this source to an existing date idea.",
    "replayed": "This capture request was already processed.",
}
SAFE_FAILURE_MESSAGE = (
    "The link could not be saved. Check the shortcut configuration and try again."
)


def fail(message: str) -> None:
    raise AssertionError(message)


def strings(value: Any) -> set[str]:
    """Return all string values nested in a plist value."""
    if isinstance(value, str):
        return {value}
    if isinstance(value, dict):
        found: set[str] = set()
        for key, child in value.items():
            found.add(str(key))
            found.update(strings(child))
        return found
    if isinstance(value, list):
        found = set()
        for child in value:
            found.update(strings(child))
        return found
    return set()


def variable_names(value: Any) -> set[str]:
    """Return variable names referenced by a serialized Shortcut value."""
    names: set[str] = set()
    if isinstance(value, dict):
        name = value.get("VariableName")
        if isinstance(name, str):
            names.add(name)
        for child in value.values():
            names.update(variable_names(child))
    elif isinstance(value, list):
        for child in value:
            names.update(variable_names(child))
    return names


def dictionary_items(value: dict[str, Any]) -> dict[str, Any]:
    serialized = value.get("Value", {})
    items = serialized.get("WFDictionaryFieldValueItems", [])
    result: dict[str, Any] = {}
    for item in items:
        key_strings = item.get("WFKey", {}).get("Value", {}).get("string")
        if not isinstance(key_strings, str):
            fail("request dictionary contains a non-text key")
        result[key_strings] = item.get("WFValue")
    return result


def matching_actions(
    actions: list[dict[str, Any]], identifier: str
) -> list[dict[str, Any]]:
    return [
        action
        for action in actions
        if action.get("WFWorkflowActionIdentifier") == identifier
    ]


def sole_action(
    actions: list[dict[str, Any]], identifier: str, description: str
) -> dict[str, Any]:
    matches = matching_actions(actions, identifier)
    if len(matches) != 1:
        fail(f"expected one {description}, found {len(matches)}")
    return matches[0]


def sole_variable_setter(
    actions: list[dict[str, Any]], variable_name: str
) -> dict[str, Any]:
    matches = [
        action
        for action in matching_actions(actions, "is.workflow.actions.setvariable")
        if action.get("WFWorkflowActionParameters", {}).get("WFVariableName")
        == variable_name
    ]
    if len(matches) != 1:
        fail(f"expected one assignment to {variable_name}, found {len(matches)}")
    return matches[0]


def require_setter_output(
    actions: list[dict[str, Any]], variable_name: str, producer: dict[str, Any]
) -> None:
    producer_uuid = producer.get("WFWorkflowActionParameters", {}).get("UUID")
    if not isinstance(producer_uuid, str):
        fail(f"producer for {variable_name} does not have a UUID")
    setter = sole_variable_setter(actions, variable_name)
    source = setter.get("WFWorkflowActionParameters", {}).get("WFInput", {}).get("Value", {})
    if source.get("OutputUUID") != producer_uuid:
        fail(f"{variable_name} is not assigned directly from its required producer")


def conditional_block(
    actions: list[dict[str, Any]], start_index: int
) -> list[dict[str, Any]]:
    start = actions[start_index].get("WFWorkflowActionParameters", {})
    grouping_identifier = start.get("GroupingIdentifier")
    for end_index in range(start_index + 1, len(actions)):
        params = actions[end_index].get("WFWorkflowActionParameters", {})
        if (
            actions[end_index].get("WFWorkflowActionIdentifier")
            == "is.workflow.actions.conditional"
            and params.get("GroupingIdentifier") == grouping_identifier
            and params.get("WFControlFlowMode") == 2
        ):
            return actions[start_index + 1 : end_index]
    fail(f"conditional {grouping_identifier} has no matching end")


def sole_conditional_index(
    actions: list[dict[str, Any]], comparison: str, input_variable: str
) -> int:
    matches = []
    for index, action in enumerate(actions):
        if action.get("WFWorkflowActionIdentifier") != "is.workflow.actions.conditional":
            continue
        params = action.get("WFWorkflowActionParameters", {})
        if (
            params.get("WFControlFlowMode") == 0
            and params.get("WFConditionalActionString") == comparison
            and variable_names(params.get("WFInput", {})) == {input_variable}
        ):
            matches.append(index)
    if len(matches) != 1:
        fail(
            f"expected one {input_variable} condition for {comparison}, found {len(matches)}"
        )
    return matches[0]


def verify(path: Path) -> int:
    if not path.is_file():
        fail(f"missing generated plist: {path}")

    with path.open("rb") as handle:
        workflow = plistlib.load(handle)

    actions = workflow.get("WFWorkflowActions", [])
    workflow_types = set(workflow.get("WFWorkflowTypes", []))
    if "ActionExtension" not in workflow_types:
        fail("shortcut is not enabled for the Share Sheet")
    if "QuickActions" not in workflow_types:
        fail("shortcut is not enabled as a macOS Quick Action")
    if "ReceivesOnScreenContent" not in workflow_types:
        fail("shortcut does not receive the active Safari page on macOS")
    quick_action_surfaces = set(workflow.get("WFQuickActionSurfaces", []))
    if "Services" not in quick_action_surfaces:
        fail("shortcut is not enabled in the macOS Services menu")
    inputs = set(workflow.get("WFWorkflowInputContentItemClasses", []))
    if not REQUIRED_INPUTS.issubset(inputs):
        fail(f"missing Share Sheet inputs: {sorted(REQUIRED_INPUTS - inputs)}")
    no_input = workflow.get("WFWorkflowNoInputBehavior", {})
    if no_input.get("Name") != "WFWorkflowNoInputBehaviorGetClipboard":
        fail("shortcut does not fall back to the clipboard")

    identifiers = [action.get("WFWorkflowActionIdentifier") for action in actions]
    required_actions = {
        "is.workflow.actions.detect.link",
        "is.workflow.actions.count",
        "is.workflow.actions.getitemfromlist",
        "is.workflow.actions.date",
        "is.workflow.actions.format.date",
        "is.workflow.actions.number.random",
        "is.workflow.actions.downloadurl",
        "is.workflow.actions.detect.dictionary",
        "is.workflow.actions.notification",
        "is.workflow.actions.alert",
        "is.workflow.actions.exit",
    }
    missing = required_actions - set(identifiers)
    if missing:
        fail(f"missing required actions: {sorted(missing)}")

    # Prove the generated dataflow preserves the first URL emitted by link
    # detection, rather than merely checking that the final request names a
    # plausibly named variable.
    detect_links = sole_action(
        actions, "is.workflow.actions.detect.link", "link-detection action"
    )
    detect_links_input = detect_links.get("WFWorkflowActionParameters", {}).get(
        "WFInput", {}
    )
    if variable_names(detect_links_input) != {"ShortcutInput"}:
        fail("link detection must consume exactly the Share Sheet ShortcutInput")
    require_setter_output(actions, "urls", detect_links)
    first_url = sole_action(
        actions, "is.workflow.actions.getitemfromlist", "first-URL selection action"
    )
    first_url_params = first_url.get("WFWorkflowActionParameters", {})
    if (
        first_url_params.get("WFItemSpecifier") != "First Item"
        or variable_names(first_url_params.get("WFInput", {})) != {"urls"}
    ):
        fail("original URL must be the first item in the detected URL output")
    require_setter_output(actions, "originalURL", first_url)
    url_text_actions = [
        action
        for action in matching_actions(actions, "is.workflow.actions.gettext")
        if variable_names(
            action.get("WFWorkflowActionParameters", {}).get("WFTextActionText", {})
        )
        == {"originalURL"}
    ]
    if len(url_text_actions) != 1:
        fail(
            "expected one text conversion directly from the first detected URL, "
            f"found {len(url_text_actions)}"
        )
    if "WFStringContentItem" not in strings(
        url_text_actions[0].get("WFWorkflowActionParameters", {}).get(
            "WFTextActionText", {}
        )
    ):
        fail("first detected URL must be converted to its exact text value")
    require_setter_output(actions, "originalURLText", url_text_actions[0])

    # Prove the idempotency key is constructed once from a custom-formatted
    # current timestamp and a nonce in the required range.
    current_date = sole_action(actions, "is.workflow.actions.date", "current-date action")
    if current_date.get("WFWorkflowActionParameters", {}).get("WFDateActionMode") != "Current Date":
        fail("request timestamp must originate from the current date")
    require_setter_output(actions, "now", current_date)
    format_date = sole_action(
        actions, "is.workflow.actions.format.date", "timestamp-format action"
    )
    format_params = format_date.get("WFWorkflowActionParameters", {})
    if (
        format_params.get("WFDateFormatStyle") != "Custom"
        or format_params.get("WFDateFormat") != "yyyyMMddHHmmssSSS"
        or variable_names(format_params.get("WFDate", {})) != {"now"}
    ):
        fail("timestamp must custom-format the current date as yyyyMMddHHmmssSSS")
    require_setter_output(actions, "timestamp", format_date)
    random_number = sole_action(
        actions, "is.workflow.actions.number.random", "request nonce action"
    )
    random_params = random_number.get("WFWorkflowActionParameters", {})
    if (
        random_params.get("WFRandomNumberMinimum") != 100000
        or random_params.get("WFRandomNumberMaximum") != 999999
    ):
        fail("request nonce must be generated in the range 100000...999999")
    require_setter_output(actions, "nonce", random_number)
    request_id_setter = sole_variable_setter(actions, "requestID")
    request_id_source = (
        request_id_setter.get("WFWorkflowActionParameters", {})
        .get("WFInput", {})
        .get("Value", {})
    )
    request_id_uuid = request_id_source.get("OutputUUID")
    request_id_producers = [
        action
        for action in matching_actions(actions, "is.workflow.actions.gettext")
        if action.get("WFWorkflowActionParameters", {}).get("UUID") == request_id_uuid
    ]
    if len(request_id_producers) != 1:
        fail("requestID must be assigned from exactly one text construction")
    request_id_value = (
        request_id_producers[0]
        .get("WFWorkflowActionParameters", {})
        .get("WFTextActionText", {})
        .get("Value", {})
    )
    attachments = request_id_value.get("attachmentsByRange", {})
    if request_id_value.get("string") != "shortcut-\ufffc-\ufffc" or {
        key: value.get("VariableName") for key, value in attachments.items()
    } != {"{9, 1}": "timestamp", "{11, 1}": "nonce"}:
        fail("requestID must be exactly shortcut-{timestamp}-{nonce}")

    conditional_starts: list[str] = []
    conditional_ends: list[str] = []
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

    requests = [
        action
        for action in actions
        if action.get("WFWorkflowActionIdentifier") == "is.workflow.actions.downloadurl"
    ]
    if len(requests) != 1:
        fail(f"expected one HTTP request action, found {len(requests)}")
    request_action = requests[0]
    request = request_action.get("WFWorkflowActionParameters", {})
    if request.get("WFHTTPMethod") != "POST" or request.get("WFHTTPBodyType") != "JSON":
        fail("capture request must be a JSON POST")
    if variable_names(request.get("WFURL", {})) != {"endpoint"}:
        fail("capture request URL must come from the endpoint import question")

    body = dictionary_items(request.get("WFJSONValues", {}))
    if set(body) != {"source_url", "client_request_id"}:
        fail(f"capture JSON has unexpected fields: {sorted(body)}")
    if variable_names(body["source_url"]) != {"originalURLText"}:
        fail("source_url must preserve the first detected URL exactly")
    if variable_names(body["client_request_id"]) != {"requestID"}:
        fail("client_request_id must use the per-execution request ID")

    headers = dictionary_items(request.get("WFHTTPHeaders", {}))
    if set(headers) != {"Authorization"}:
        fail("capture request must contain only the Authorization header")
    if variable_names(headers["Authorization"]) != {"token"}:
        fail("Authorization header must reference the configured token")
    if not any(text.startswith("Bearer ") for text in strings(headers["Authorization"])):
        fail("Authorization header must use the Bearer scheme")

    # Prove the response parsing chain consumes the sole HTTP request output.
    # These checks prevent a generated workflow from retaining plausible
    # variable names while silently reading stale or unrelated action output.
    require_setter_output(actions, "response", request_action)
    response_dictionary = sole_action(
        actions, "is.workflow.actions.detect.dictionary", "response dictionary action"
    )
    response_dictionary_input = response_dictionary.get(
        "WFWorkflowActionParameters", {}
    ).get("WFInput", {})
    if variable_names(response_dictionary_input) != {"response"}:
        fail("response dictionary must consume only the HTTP response")
    require_setter_output(actions, "responseDictionary", response_dictionary)

    response_key_actions = [
        action
        for action in matching_actions(actions, "is.workflow.actions.getvalueforkey")
        if action.get("WFWorkflowActionParameters", {}).get(
            "WFGetDictionaryValueType"
        )
        == "All Keys"
    ]
    if response_key_actions:
        fail("response parsing must not use the crashing all-keys conditional guard")

    status_text_actions = []
    for action in matching_actions(actions, "is.workflow.actions.gettext"):
        status_text = (
            action.get("WFWorkflowActionParameters", {})
            .get("WFTextActionText", {})
            .get("Value", {})
        )
        attachments = status_text.get("attachmentsByRange", {})
        if (
            status_text.get("string") == "\ufffc"
            and len(attachments) == 1
            and list(attachments.values())
            == [
                {
                    "Aggrandizements": [
                        {
                            "DictionaryKey": "status",
                            "Type": "WFDictionaryValueVariableAggrandizement",
                        }
                    ],
                    "Type": "Variable",
                    "VariableName": "responseDictionary",
                }
            ]
        ):
            status_text_actions.append(action)
    if len(status_text_actions) != 1:
        fail(
            "expected one status text action reading only "
            f"responseDictionary['status'], found {len(status_text_actions)}"
        )
    require_setter_output(actions, "status", status_text_actions[0])

    questions = workflow.get("WFWorkflowImportQuestions", [])
    if {question.get("Text") for question in questions} != EXPECTED_QUESTIONS:
        fail("unexpected Save Date Idea API import questions")
    if {question.get("DefaultValue") for question in questions} != EXPECTED_DEFAULTS:
        fail("import-question defaults must remain non-secret placeholders")
    trim_indexes = [
        index
        for index, action in enumerate(actions)
        if action.get("WFWorkflowActionIdentifier")
        == "is.workflow.actions.text.trimwhitespace"
    ]
    if len(trim_indexes) != 2:
        fail(f"expected two configured text inputs, found {len(trim_indexes)}")
    if {question.get("ActionIndex") for question in questions} != set(trim_indexes):
        fail("import questions point at the wrong actions")
    if {question.get("ParameterKey") for question in questions} != {"WFInput"}:
        fail("import questions must configure the trim actions")

    conditional_strings = {
        params.get("WFConditionalActionString")
        for action in actions
        if action.get("WFWorkflowActionIdentifier") == "is.workflow.actions.conditional"
        for params in [action.get("WFWorkflowActionParameters", {})]
        if params.get("WFControlFlowMode") == 0
    }
    if not SUCCESS_STATUSES.issubset(conditional_strings):
        fail(f"missing distinct success branches: {sorted(SUCCESS_STATUSES - conditional_strings)}")

    for status, expected_message in SUCCESS_FEEDBACK.items():
        block = conditional_block(actions, sole_conditional_index(actions, status, "status"))
        notifications = [
            (index, action)
            for index, action in enumerate(block)
            if action.get("WFWorkflowActionIdentifier")
            == "is.workflow.actions.notification"
        ]
        exits = [
            index
            for index, action in enumerate(block)
            if action.get("WFWorkflowActionIdentifier") == "is.workflow.actions.exit"
        ]
        if len(notifications) != 1 or (
            notifications[0][1]
            .get("WFWorkflowActionParameters", {})
            .get("WFNotificationActionBody")
            != expected_message
        ):
            fail(f"{status} branch is not paired with its required notification")
        if not exits or exits[0] <= notifications[0][0]:
            fail(f"{status} branch must exit after its notification and before its end")

    user_feedback = {
        text
        for action in actions
        if action.get("WFWorkflowActionIdentifier")
        in {"is.workflow.actions.notification", "is.workflow.actions.alert"}
        for text in strings(action.get("WFWorkflowActionParameters", {}))
    }
    for marker in (
        "Saved a new date idea.",
        "Added this source to an existing date idea.",
        "This capture request was already processed.",
        SAFE_FAILURE_MESSAGE,
    ):
        if marker not in user_feedback:
            fail(f"missing safe user feedback: {marker}")
    if any("Bearer " in text for text in user_feedback):
        fail("user feedback must never expose the bearer token")

    print(f"Verified Save Date Idea API contract across {len(actions)} actions in {path}")
    return 0


def main(path: str) -> int:
    return verify(Path(path))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} WORKFLOW.plist", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
