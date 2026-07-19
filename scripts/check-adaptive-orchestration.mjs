#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.argv[2] ?? fileURLToPath(new URL("..", import.meta.url)));
const failures = [];

function read(path) {
  try {
    return readFileSync(resolve(root, path), "utf8");
  } catch {
    failures.push(`${path} is missing or unreadable`);
    return "";
  }
}

function requireMatch(text, pattern, message) {
  if (!pattern.test(text)) failures.push(message);
}

const skill = read(".agents/skills/adaptive-orchestration/SKILL.md");
requireMatch(
  skill,
  /^name: adaptive-orchestration$/m,
  "adaptive-orchestration skill name is missing",
);
requireMatch(skill, /^description: .+$/m, "adaptive-orchestration trigger description is missing");
requireMatch(
  skill,
  /docs\/agents\/adaptive-orchestration\.md/,
  "skill must route to the orchestration policy",
);
if (/\bTODO\b/.test(skill)) failures.push("adaptive-orchestration skill contains TODO text");

const config = read(".codex/config.toml");
for (const feature of ["goals", "hooks", "multi_agent", "unified_exec"]) {
  requireMatch(
    config,
    new RegExp(`^${feature}\\s*=\\s*true$`, "m"),
    `${feature} must remain enabled`,
  );
}
requireMatch(config, /^max_threads\s*=\s*4$/m, "max_threads must remain 4");
requireMatch(config, /^max_depth\s*=\s*1$/m, "max_depth must remain 1");
for (const unstable of ["runtime_metrics", "token_budget", "multi_agent_v2", "enable_fanout"]) {
  if (new RegExp(`^${unstable}\\s*=`, "m").test(config)) {
    failures.push(`${unstable} must remain unset until stable and evidence-backed`);
  }
}

const hooksText = read(".codex/hooks.json");
try {
  const hooks = JSON.parse(hooksText);
  const preTool = hooks?.hooks?.PreToolUse;
  if (!Array.isArray(preTool) || !preTool.some((entry) => entry.matcher === "^Bash$")) {
    failures.push("PreToolUse must retain the ^Bash$ matcher");
  }
} catch {
  failures.push(".codex/hooks.json must contain valid JSON");
}

const agents = read("AGENTS.md");
requireMatch(
  agents,
  /adaptive-orchestration/,
  "AGENTS.md must route long goals to adaptive-orchestration",
);
requireMatch(
  agents,
  /Only request a human interview/,
  "AGENTS.md must reserve human interviews for unresolved ambiguity",
);

const policy = read("docs/agents/adaptive-orchestration.md");
for (const heading of [
  "Goal record",
  "Evidence and dependency gate",
  "Context and task selection",
  "Agent allocation",
  "Autonomous learning loop",
  "Tracker ceremony",
  "Goal change log",
]) {
  requireMatch(
    policy,
    new RegExp(`^## ${heading}$`, "m"),
    `orchestration policy is missing ${heading}`,
  );
}
requireMatch(
  policy,
  /append-only/,
  "orchestration policy must require an append-only goal history",
);
for (const outcome of ["promoted", "linked", "no-new-lesson"]) {
  requireMatch(
    policy,
    new RegExp(`\\b${outcome}\\b`),
    `orchestration policy must define the ${outcome} retrospective outcome`,
  );
}

const continuation = read(".codex/goals/CONTINUATION.md");
requireMatch(
  continuation,
  /autonomous learning loop/,
  "continuation must route admitted runs through the autonomous learning loop",
);

const issueTracker = read("docs/agents/issue-tracker.md");
requireMatch(
  issueTracker,
  /^## Autonomous merge gate$/m,
  "issue tracker must define the autonomous merge gate",
);
requireMatch(
  issueTracker,
  /exact remote\s+head/i,
  "autonomous merge gate must bind verdicts to the exact remote head",
);
requireMatch(
  issueTracker,
  /--match-head-commit/,
  "autonomous merge must atomically match the reviewed head",
);

const controller = read("scripts/symphony-controller.mjs");
const mutationLock = read("scripts/mutation-lock.py");
const controllerHarness = read("tests/support/symphony-controller-harness.mjs");
requireMatch(
  controller,
  /kind: "standards-review"/,
  "controller completion must require a standards-review record",
);
for (const invariant of [
  ["schemaVersion: 2", "controller must use the versioned authority schema"],
  ["record-iteration", "controller must persist every material iteration review"],
  ['kind: "goal-completion"', "controller must require goal-specific completion evidence"],
  ["mutation-lock.py", "controller must use the OS-backed mutation lock"],
  ["replayTransition", "controller must replay state/history transitions"],
  ["resolve-question", "controller must support explicit ambiguity resolution"],
  ["claim-child", "controller must issue direct-child claims"],
  ["settle-child", "controller must settle direct-child claims"],
  ["caller-child-count-forbidden", "controller must reject caller-authored child counts"],
  ["caller-repair-count-forbidden", "controller must reject caller-authored repair counts"],
]) {
  requireMatch(controller, new RegExp(invariant[0]), invariant[1]);
}
requireMatch(
  mutationLock,
  /os\.execvpe/,
  "OS mutex ownership must be inherited by the mutating controller process",
);
requireMatch(
  mutationLock,
  /def verify\(/,
  "OS mutex inheritance must be verified rather than trusted from ambient state",
);
requireMatch(
  controller,
  /independent-child-claim-required/,
  "independent agent evidence must bind a completed controller claim",
);
if (/SYMPHONY_CONTROLLER_TEST/.test(controller)) {
  failures.push("production controller must not trust ambient test-mode flags");
}
requireMatch(
  controllerHarness,
  /runController/,
  "deterministic controller faults must use the test-only harness",
);
for (const outcome of ["promoted", "linked", "no-new-lesson"]) {
  requireMatch(
    controller,
    new RegExp(`"${outcome}"`),
    `controller must accept the ${outcome} retrospective outcome`,
  );
}

const learningRegistry = read("docs/learning/README.md");
requireMatch(
  learningRegistry,
  /Every material goal iteration/,
  "learning registry must cover every material goal iteration",
);
const learningTemplate = read("docs/learning/TEMPLATE.md");
requireMatch(
  learningTemplate,
  /Iteration outcome: promoted/,
  "learning template must record a promoted iteration outcome",
);
requireMatch(
  learningTemplate,
  /Enforcing guard/,
  "learning template must require an enforcing guard",
);

const handoff = read("docs/agents/handoff-template.md");
requireMatch(handoff, /Goal change log/, "handoff template must record the goal change log");
requireMatch(
  handoff,
  /Context lifecycle/,
  "handoff template must record context lifecycle evidence",
);

const lifecycle = read("docs/research/codex-context-lifecycle.md");
for (const zone of ["Smart", "Watch", "Transition", "Dumb / unsafe to extend"]) {
  if (!lifecycle.includes(`**${zone}**`)) failures.push(`context lifecycle is missing ${zone}`);
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exit(1);
}

console.log("Adaptive orchestration policy passed.");
