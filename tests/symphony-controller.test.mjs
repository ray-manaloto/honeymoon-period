import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const controller = resolve(import.meta.dirname, "../scripts/symphony-controller.mjs");
const authorityOptions = {
  completionContractRef: "docs/completion.md",
  externalCompletion: "not-required",
  last30daysRef: "docs/last30days.md",
  last30daysReason: "bounded-local-contract",
  last30daysStatus: "not-needed",
  objectiveRef: "docs/goal.md",
  prohibitedActionsRef: "docs/prohibitions.md",
  researchRef: "docs/research.md",
  researchReason: "bounded-local-contract",
  researchStatus: "not-needed",
};
function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function createFixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "honeymoon-goal-"));
  git(root, "init", "-q");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "Fixture");
  mkdirSync(join(root, "owned"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "owned/input.txt"), "revision one\n");
  for (const name of [
    "completion.md",
    "goal.md",
    "last30days.md",
    "prohibitions.md",
    "research.md",
  ]) {
    writeFileSync(join(root, "docs", name), `${name}\n`);
  }
  git(root, "add", ".");
  git(root, "commit", "-qm", "fixture");
  run(root, "init", {
    goal: "fixture-goal",
    objective: "Exercise the bounded controller",
    ...authorityOptions,
    ownedInput: "owned/input.txt",
    ttlMs: 1_000,
    maxRuntimeMs: 10_000,
    maxRetries: 2,
    maxRepairCycles: 1,
    maxDirectChildren: 2,
    ...overrides,
  });
  git(root, "add", ".codex/goals");
  git(root, "commit", "-qm", "track goal");
  return root;
}

function argsFor(options) {
  return Object.entries(options).flatMap(([key, value]) => {
    if (value === undefined) return [];
    const flag = `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    return Array.isArray(value)
      ? value.flatMap((item) => [flag, String(item)])
      : [flag, String(value)];
  });
}

function command(root, action, options = {}) {
  return spawnSync("node", [controller, action, "--root", root, ...argsFor(options)], {
    encoding: "utf8",
    env: { ...process.env, SYMPHONY_CONTROLLER_TEST_MODE: "1" },
  });
}

function run(root, action, options = {}) {
  const result = command(root, action, options);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function active(root) {
  return JSON.parse(readFileSync(join(root, ".codex/goals/active.json"), "utf8"));
}

function history(root) {
  return readFileSync(join(root, ".codex/goals/history.jsonl"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function evidenceRecords(root, completedAt) {
  const directory = join(root, ".codex/goals/.evidence");
  mkdirSync(directory, { recursive: true });
  const revision = active(root).revision.fingerprint;
  const head = git(root, "rev-parse", "HEAD");
  const authority = active(root).authority;
  const records = {
    aggregateRecord: {
      kind: "aggregate-check",
      status: "PASS",
      revision,
      completedAt,
      head,
      command: "npm run check",
    },
    completionRecord: {
      kind: "goal-completion",
      status: "PASS",
      revision,
      completedAt,
      head,
      branch: git(root, "branch", "--show-current"),
      externalState: authority.externalCompletion === "required" ? "complete" : "not-required",
      ...(authority.externalCompletion === "required"
        ? { externalEvidenceRef: "docs/goal.md" }
        : {}),
      last30daysEvidenceRef: authority.last30days.evidenceRef,
      logicalCommit: head,
      researchEvidenceRef: authority.research.evidenceRef,
      zeroDebt: true,
      zeroDebtEvidenceRef: "docs/goal.md",
    },
    protectedArtifactRecord: {
      kind: "protected-artifact-audit",
      status: "PASS",
      revision,
      completedAt,
      head,
      command: "git diff --exit-code -- shortcut dist",
    },
    reviewerRecord: {
      kind: "standards-review",
      verdict: "PASS",
      revision,
      completedAt,
      head,
      agentId: "fresh-reviewer-fixture",
      fresh: true,
    },
    retrospectiveRecord: {
      kind: "retrospective",
      outcome: "no-new-lesson",
      revision,
      completedAt,
      head,
      evidenceRef: "docs/goal.md",
      reasonCode: "routine-green-no-new-pattern",
    },
    validatorRecord: {
      kind: "validator",
      verdict: "PASS",
      revision,
      completedAt,
      head,
      agentId: "fresh-validator-fixture",
      fresh: true,
    },
    verifierRecord: {
      kind: "verifier",
      verdict: "ACCEPT",
      revision,
      completedAt,
      head,
      agentId: "fresh-verifier-fixture",
      fresh: true,
    },
  };
  const options = {};
  for (const [name, record] of Object.entries(records)) {
    if (record.agentId) {
      const report = `${record.verdict}\nIndependent fixture evidence.\n`;
      const reportRelative = `.codex/goals/.evidence/${name}.report.txt`;
      writeFileSync(join(root, reportRelative), report);
      record.source = "collaboration-agent-output";
      record.taskRef = name;
      record.reportPath = reportRelative;
      record.reportHash = createHash("sha256").update(report).digest("hex");
    }
    const relative = `.codex/goals/.evidence/${name}.json`;
    writeFileSync(join(root, relative), `${JSON.stringify(record)}\n`);
    options[name] = relative;
  }
  return options;
}

function recordGreenIteration(root, ownerToken, completedAt) {
  const records = evidenceRecords(root, completedAt);
  return run(root, "record-iteration", {
    ownerToken,
    retrospectiveCode: "no-new-lesson",
    retrospectiveRecord: records.retrospectiveRecord,
    reviewerRecord: records.reviewerRecord,
    reviewVerdict: "PASS",
    now: completedAt,
  });
}

function runAsync(root, action, options = {}) {
  const { testAdoptPrelockPauseMs, testQuestionPrelockPauseMs, ...commandOptions } = options;
  return new Promise((resolveResult) => {
    const child = spawn("node", [controller, action, "--root", root, ...argsFor(commandOptions)], {
      env: {
        ...process.env,
        SYMPHONY_CONTROLLER_TEST_MODE: "1",
        ...(testAdoptPrelockPauseMs
          ? { SYMPHONY_CONTROLLER_TEST_ADOPT_PRELOCK_PAUSE_MS: String(testAdoptPrelockPauseMs) }
          : {}),
        ...(testQuestionPrelockPauseMs
          ? {
              SYMPHONY_CONTROLLER_TEST_QUESTION_PRELOCK_PAUSE_MS: String(
                testQuestionPrelockPauseMs,
              ),
            }
          : {}),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdout.setEncoding("utf8").on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("close", (status) => {
      resolveResult({ result: stdout ? JSON.parse(stdout) : null, status, stderr });
    });
  });
}

async function waitForPath(path) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(path)) return;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 25));
  }
  assert.fail(`timed out waiting for ${path}`);
}

test("atomic lease contention admits exactly one concurrent writer", async () => {
  const root = createFixture();
  run(root, "reconcile", { now: "2026-07-19T09:59:59.000Z" });
  const results = await Promise.all([
    runAsync(root, "wake", { wakeToken: "concurrent-a", now: "2026-07-19T10:00:00.000Z" }),
    runAsync(root, "wake", { wakeToken: "concurrent-b", now: "2026-07-19T10:00:00.000Z" }),
  ]);
  assert.deepEqual(
    results.map(({ status }) => status),
    [0, 0],
    results.map(({ stderr }) => stderr).join("\n"),
  );
  assert.equal(
    results.filter(({ result }) => result.action === "run").length,
    1,
    JSON.stringify(results),
  );
  assert.equal(
    results.filter(({ result }) =>
      ["lease-contention", "lease-held", "mutation-contention"].includes(result.reason),
    ).length,
    1,
  );
});

test("safe startup admits one writer and duplicate wakeups do not consume attempts", () => {
  const root = createFixture();
  const first = run(root, "wake", { wakeToken: "same", now: "2026-07-19T10:00:00.000Z" });
  assert.equal(first.action, "run");
  assert.equal(first.state, "running");
  const duplicate = run(root, "wake", {
    wakeToken: "same",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.equal(duplicate.action, "noop");
  assert.equal(duplicate.reason, "duplicate-wakeup");
  assert.equal(active(root).budgets.runsUsed, 1);
});

test("state-only commits do not self-invalidate the tracked goal revision", () => {
  const root = createFixture();
  const before = active(root).revision.fingerprint;
  run(root, "reconcile", { now: "2026-07-19T10:00:00.000Z" });
  assert.equal(active(root).revision.fingerprint, before);
  assert.equal(history(root).filter((entry) => entry.type === "evidence-invalidated").length, 0);
});

test("switching branches at the same HEAD violates recorded goal authority", () => {
  const root = createFixture();
  git(root, "switch", "-q", "-c", "foreign-branch");
  const result = run(root, "reconcile", { now: "2026-07-19T10:00:00.000Z" });
  assert.equal(result.reason, "authority-branch-mismatch");
  assert.equal(result.state, "blocked");
});

test("a live lease cannot renew after a same-HEAD branch switch", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  git(root, "switch", "-q", "-c", "foreign-branch");
  const renewed = command(root, "renew", {
    ownerToken: lease.ownerToken,
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(renewed.status, 0);
  assert.match(renewed.stderr, /lease-lost/);
});

test("crash restart fences a stale lease and a lost owner cannot checkpoint", () => {
  const root = createFixture();
  const first = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const second = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  assert.equal(second.action, "run");
  assert.notEqual(second.ownerToken, first.ownerToken);
  const lost = command(root, "checkpoint", {
    ownerToken: first.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:02.100Z",
  });
  assert.notEqual(lost.status, 0);
  assert.match(lost.stderr, /lease-lost/);
  assert.ok(history(root).some((event) => event.type === "stale-lease-reconciled"));
});

test("a live owner can renew before the TTL and checkpoint within the run deadline", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const renewed = run(root, "renew", {
    ownerToken: lease.ownerToken,
    now: "2026-07-19T10:00:00.900Z",
  });
  assert.equal(renewed.action, "renewed");
  const checkpoint = run(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:01.500Z",
  });
  assert.equal(checkpoint.state, "waiting");
});

test("startup replays a crashed non-checkpoint state and history transition once", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const crashed = command(root, "renew", {
    ownerToken: lease.ownerToken,
    now: "2026-07-19T10:00:00.500Z",
    testCrashAfter: "transition-state",
  });
  assert.equal(crashed.status, 86);
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:00.600Z" });
  assert.equal(recovered.reason, "lease-held");
  assert.equal(history(root).filter((entry) => entry.type === "lease-renewed").length, 1);
});

test("startup replays a crashed reconciliation transition once", () => {
  const root = createFixture();
  run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  rmSync(join(root, ".codex/goals/.lease"), { recursive: true });
  const crashed = command(root, "reconcile", {
    now: "2026-07-19T10:00:00.100Z",
    testCrashAfter: "transition-state",
  });
  assert.equal(crashed.status, 86);
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:00.200Z" });
  assert.equal(recovered.state, "ready");
  assert.equal(
    history(root).filter((entry) => entry.type === "missing-lease-reconciled").length,
    1,
  );
});

test("owned-input changes fence a live lease even when HEAD is unchanged", () => {
  const root = createFixture();
  const priorRevision = active(root).revision.fingerprint;
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  recordGreenIteration(root, lease.ownerToken, "2026-07-19T10:00:00.050Z");
  writeFileSync(join(root, "owned/input.txt"), "uncommitted revision\n");
  const reconciled = run(root, "reconcile", { now: "2026-07-19T10:00:00.100Z" });
  assert.equal(reconciled.state, "blocked");
  assert.equal(reconciled.reason, "dirty-tree-conflict");
  assert.equal(active(root).revision.fingerprint, priorRevision);
  const lost = command(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.200Z",
  });
  assert.notEqual(lost.status, 0);
  assert.match(lost.stderr, /lease-lost/);
});

test("duplicate wakeup still reconciles and removes its stale lease", () => {
  const root = createFixture();
  run(root, "wake", { wakeToken: "same", now: "2026-07-19T10:00:00.000Z" });
  const duplicate = run(root, "wake", {
    wakeToken: "same",
    now: "2026-07-19T10:00:02.000Z",
  });
  assert.equal(duplicate.reason, "duplicate-wakeup");
  assert.equal(existsSync(join(root, ".codex/goals/.lease")), false);
});

test("startup reconciles an abandoned malformed lease", () => {
  const root = createFixture();
  const leasePath = join(root, ".codex/goals/.lease");
  mkdirSync(leasePath);
  writeFileSync(join(leasePath, "owner.json"), "{malformed");
  utimesSync(leasePath, new Date(0), new Date(0));
  const result = run(root, "reconcile", { now: "2026-07-19T10:00:00.000Z" });
  assert.equal(result.state, "ready");
  assert.equal(existsSync(leasePath), false);
});

test("changed HEAD and owned inputs invalidate revision-bound evidence", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...evidenceRecords(root, "2026-07-19T10:00:00.050Z"),
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.equal(active(root).state, "complete");
  assert.ok(
    active(root).learning.completed.some(
      (iteration) => iteration.revision === active(root).revision.fingerprint,
    ),
  );
  assert.ok(history(root).some((event) => event.type === "completion-evidence"));
  writeFileSync(join(root, "owned/input.txt"), "revision two\n");
  git(root, "add", "owned/input.txt");
  git(root, "commit", "-qm", "change owned input");
  const reconciled = run(root, "reconcile", { now: "2026-07-19T10:00:03.000Z" });
  assert.equal(reconciled.state, "ready");
  assert.equal(active(root).evidence.current.length, 0);
  assert.ok(history(root).some((event) => event.type === "evidence-invalidated"));
  assert.ok(history(root).some((event) => event.type === "completion-evidence"));
});

test("unowned dirty-tree conflicts block admission without taking a lease", () => {
  const root = createFixture();
  writeFileSync(join(root, "conflict.txt"), "unowned\n");
  const result = run(root, "wake", {
    wakeToken: "dirty",
    now: "2026-07-19T10:00:00.000Z",
  });
  assert.equal(result.action, "noop");
  assert.equal(result.state, "blocked");
  assert.equal(result.reason, "dirty-tree-conflict");
});

test("one ambiguity fingerprint emits one redacted operator question", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "blocked",
    question: "Use https://example.test/private?token=secret or request API_KEY=abc?",
    now: "2026-07-19T10:00:00.100Z",
  });
  const asked = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  assert.equal(asked.action, "ask");
  assert.doesNotMatch(asked.question, /token=secret|API_KEY=abc/);
  const duplicate = run(root, "wake", {
    wakeToken: "three",
    now: "2026-07-19T10:00:03.000Z",
  });
  assert.equal(duplicate.action, "noop");
  assert.equal(duplicate.reason, "blocked-question-already-emitted");
  assert.equal(history(root).filter((event) => event.type === "operator-question").length, 1);
});

test("concurrent blocked wakes emit one ambiguity question", async () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    question: "Which already-authorized option should continue?",
    state: "blocked",
    now: "2026-07-19T10:00:00.100Z",
  });
  const results = await Promise.all([
    runAsync(root, "wake", { wakeToken: "question-a", now: "2026-07-19T10:00:02.000Z" }),
    runAsync(root, "wake", { wakeToken: "question-b", now: "2026-07-19T10:00:02.000Z" }),
  ]);
  assert.equal(
    results.filter(({ result }) => result.action === "ask").length,
    1,
    JSON.stringify(results),
  );
  assert.equal(
    results.filter(({ result }) =>
      [
        "blocked-question-already-emitted",
        "mutation-contention",
        "question-emission-in-progress",
      ].includes(result.reason),
    ).length,
    1,
  );
});

test("waiting wakes honor due time before reacquiring", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
  });
  const early = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  assert.equal(early.reason, "waiting-not-due");
  const due = run(root, "wake", { wakeToken: "three", now: "2026-07-19T10:00:05.000Z" });
  assert.equal(due.action, "run");
});

test("unchanged failures stop repair while changed failures consume bounded budgets", () => {
  const root = createFixture();
  let lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "failed",
    failureFingerprint: "test-a",
    repair: 1,
    now: "2026-07-19T10:00:00.100Z",
  });
  lease = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  const unchanged = run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "failed",
    failureFingerprint: "test-a",
    repair: 1,
    now: "2026-07-19T10:00:02.100Z",
  });
  assert.equal(unchanged.state, "failed");
  assert.equal(unchanged.reason, "unchanged-failure");
  assert.equal(active(root).budgets.repairCyclesUsed, 1);
});

test("time retry repair and direct-child budgets are bounded", () => {
  const root = createFixture({ maxRuntimeMs: 100, maxRetries: 0, maxRepairCycles: 0 });
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const overDelegated = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "waiting",
    directChildren: 3,
    now: "2026-07-19T10:00:00.050Z",
  });
  assert.notEqual(overDelegated.status, 0);
  assert.match(overDelegated.stderr, /direct-child-budget-exhausted/);
  const timedOut = run(root, "reconcile", { now: "2026-07-19T10:00:00.200Z" });
  assert.equal(timedOut.state, "failed");
  assert.equal(timedOut.reason, "time-budget-exhausted");
});

test("production commands reject injected time and checkpoints enforce the run deadline", () => {
  const root = createFixture({ maxRuntimeMs: 100 });
  const injected = spawnSync(
    "node",
    [controller, "reconcile", "--root", root, "--now", "2026-07-19T10:00:00.000Z"],
    { encoding: "utf8", env: { ...process.env, SYMPHONY_CONTROLLER_TEST_MODE: "0" } },
  );
  assert.notEqual(injected.status, 0);
  assert.match(injected.stderr, /injected-time-forbidden/);

  const lease = run(root, "wake", { wakeToken: "deadline", now: "2026-07-19T10:00:00.000Z" });
  const expired = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "waiting",
    dueAt: "2026-07-19T10:00:01.000Z",
    now: "2026-07-19T10:00:00.200Z",
  });
  assert.notEqual(expired.status, 0);
  assert.match(expired.stderr, /time-budget-exhausted/);
});

test("retry and repair exhaustion stops without manufacturing ambiguity", () => {
  const root = createFixture({ maxRepairCycles: 0, maxRetries: 0 });
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const goal = active(root);
  assert.equal("ownerToken" in goal.run, false);
  assert.equal("lastWakeToken" in goal, false);
  assert.doesNotMatch(JSON.stringify(goal), new RegExp(lease.ownerToken));
  const failed = run(root, "checkpoint", {
    failureFingerprint: "new-failure",
    ownerToken: lease.ownerToken,
    repair: 1,
    state: "failed",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.equal(failed.reason, "repair-budget-exhausted");
  const exhausted = run(root, "wake", {
    wakeToken: "two",
    now: "2026-07-19T10:00:02.000Z",
  });
  assert.equal(exhausted.action, "noop");
  assert.equal(exhausted.state, "failed");
  assert.equal(exhausted.reason, "repair-budget-exhausted");
  assert.equal(active(root).question, null);
});

test("retry exhaustion is journaled before admission stops", () => {
  const root = createFixture({ maxRetries: 0 });
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    failureFingerprint: "distinct-failure",
    ownerToken: lease.ownerToken,
    state: "failed",
    now: "2026-07-19T10:00:00.100Z",
  });
  const stopped = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  assert.equal(stopped.reason, "retry-budget-exhausted");
  assert.equal(history(root).filter((entry) => entry.type === "retry-budget-exhausted").length, 1);
});

test("completed current revisions never run again", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...evidenceRecords(root, "2026-07-19T10:00:00.050Z"),
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  const result = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:02.000Z" });
  assert.equal(result.action, "noop");
  assert.equal(result.reason, "goal-complete");
});

test("stolen lease authority is fenced and running state recovers", () => {
  const root = createFixture();
  run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const ownerPath = join(root, ".codex/goals/.lease/owner.json");
  const owner = JSON.parse(readFileSync(ownerPath, "utf8"));
  writeFileSync(ownerPath, `${JSON.stringify({ ...owner, ownerToken: "stolen" })}\n`);
  const result = run(root, "reconcile", { now: "2026-07-19T10:00:00.100Z" });
  assert.equal(result.state, "ready");
  assert.equal(existsSync(join(root, ".codex/goals/.lease")), false);
});

test("startup sweeps fenced lease residue and clears abandoned running state", () => {
  const root = createFixture();
  run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  renameSync(join(root, ".codex/goals/.lease"), join(root, ".codex/goals/.lease.stale-crash"));
  const result = run(root, "reconcile", { now: "2026-07-19T10:00:00.100Z" });
  assert.equal(result.state, "ready");
  assert.equal(existsSync(join(root, ".codex/goals/.lease.stale-crash")), false);
  assert.ok(history(root).some((entry) => entry.type === "lease-residue-reconciled"));
});

test("startup replays a checkpoint journal committed to active state", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const crashed = command(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
    testCrashAfter: "active",
  });
  assert.equal(crashed.status, 86);
  assert.equal(active(root).state, "waiting");
  assert.equal(history(root).filter((entry) => entry.type === "checkpoint").length, 0);
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:00.200Z" });
  assert.equal(recovered.state, "waiting");
  assert.equal(existsSync(join(root, ".codex/goals/.lease")), false);
  assert.equal(history(root).filter((entry) => entry.type === "checkpoint").length, 1);
});

test("startup discards an uncommitted checkpoint journal without false history", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const crashed = command(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
    testCrashAfter: "journal",
  });
  assert.equal(crashed.status, 86);
  assert.equal(active(root).state, "running");
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:02.000Z" });
  assert.equal(recovered.state, "ready");
  assert.equal(history(root).filter((entry) => entry.type === "checkpoint").length, 0);
});

test("OS-backed mutation serialization prevents takeover during a checkpoint", async () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const checkpointing = runAsync(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
    testPauseMs: 2_000,
  });
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  const contender = run(root, "wake", {
    wakeToken: "two",
    now: "2026-07-19T10:00:02.000Z",
  });
  assert.equal(contender.reason, "mutation-contention");
  const completed = await checkpointing;
  assert.equal(completed.status, 0, completed.stderr);
  assert.equal(completed.result.state, "waiting");
});

test("a crashed mutation owner releases the OS lock for startup reconciliation", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const crashed = command(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
    testCrashAfter: "journal",
  });
  assert.equal(crashed.status, 86);
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:02.000Z" });
  assert.equal(recovered.state, "ready");
});

test("question claim recovers after a pre-emission crash window", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    question: "Which authorized option should continue?",
    state: "blocked",
    now: "2026-07-19T10:00:00.100Z",
  });
  const goal = active(root);
  const claim = join(root, `.codex/goals/.question-${goal.question.fingerprint}/emission.json`);
  writeFileSync(
    claim,
    `${JSON.stringify({ claimedAt: "2026-07-19T09:00:00.000Z", fingerprint: goal.question.fingerprint })}\n`,
  );
  const recovered = run(root, "wake", {
    wakeToken: "two",
    now: "2026-07-19T10:00:02.000Z",
  });
  assert.equal(recovered.action, "ask");
});

test("an unacknowledged ambiguity question is retried and explicit resolution resumes work", () => {
  const root = createFixture({ ttlMs: 1_000 });
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    question: "Which authorized option should continue?",
    state: "blocked",
    now: "2026-07-19T10:00:00.100Z",
  });
  const first = run(root, "wake", { wakeToken: "two", now: "2026-07-19T10:00:00.200Z" });
  assert.equal(first.action, "ask");
  const retried = run(root, "wake", {
    wakeToken: "three",
    now: "2026-07-19T10:00:01.300Z",
  });
  assert.equal(retried.action, "ask");
  assert.equal(retried.question, first.question);
  assert.equal(
    history(root).filter((entry) => entry.type === "operator-question-delivered").length,
    2,
  );
  assert.equal(
    history(root).filter((entry) => entry.type === "operator-question-delivery-retried").length,
    1,
  );
  const fingerprint = active(root).question.fingerprint;
  const resolutionPath = ".codex/goals/.evidence/operator-resolution.json";
  mkdirSync(join(root, ".codex/goals/.evidence"), { recursive: true });
  writeFileSync(
    join(root, resolutionPath),
    `${JSON.stringify({
      authorityRef: "docs/missing-decision.md",
      completedAt: "2026-07-19T10:00:01.350Z",
      head: git(root, "rev-parse", "HEAD"),
      kind: "operator-resolution",
      questionFingerprint: fingerprint,
      revision: active(root).revision.fingerprint,
      status: "ACCEPT",
    })}\n`,
  );
  const rejectedResolution = command(root, "resolve-question", {
    questionFingerprint: fingerprint,
    resolutionRecord: resolutionPath,
    now: "2026-07-19T10:00:01.400Z",
  });
  assert.notEqual(rejectedResolution.status, 0);
  assert.match(rejectedResolution.stderr, /invalid-operator-authority-ref/);
  const resolution = JSON.parse(readFileSync(join(root, resolutionPath), "utf8"));
  writeFileSync(
    join(root, resolutionPath),
    `${JSON.stringify({ ...resolution, authorityRef: "docs/goal.md" })}\n`,
  );
  const resolved = run(root, "resolve-question", {
    questionFingerprint: fingerprint,
    resolutionRecord: resolutionPath,
    now: "2026-07-19T10:00:01.400Z",
  });
  assert.equal(resolved.state, "ready");
  assert.equal(active(root).question, null);
});

test("question emission cannot restore state invalidated by reconciliation", async () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  recordGreenIteration(root, lease.ownerToken, "2026-07-19T10:00:00.050Z");
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    question: "Which authorized option should continue?",
    state: "blocked",
    now: "2026-07-19T10:00:00.100Z",
  });
  const questionFingerprint = active(root).question.fingerprint;
  const delayed = runAsync(root, "wake", {
    wakeToken: "two",
    now: "2026-07-19T10:00:01.000Z",
    testQuestionPrelockPauseMs: 2_000,
  });
  await waitForPath(
    join(root, `.codex/goals/.question-${questionFingerprint}/test-prelock-paused`),
  );
  writeFileSync(join(root, "owned/input.txt"), "revision two\n");
  git(root, "add", "owned/input.txt");
  git(root, "commit", "-qm", "invalidate question revision");
  const emission = await delayed;
  assert.equal(emission.status, 0, emission.stderr);
  assert.equal(emission.result.reason, "question-invalidated");
  assert.equal(active(root).state, "ready");
  assert.equal(active(root).question, null);
});

test("tracked state stores fingerprints instead of objective worktree or question text", () => {
  const root = createFixture();
  let goal = active(root);
  assert.equal("objective" in goal, false);
  assert.equal("worktree" in goal.revision, false);
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    question: "Private free-form ambiguity",
    state: "blocked",
    now: "2026-07-19T10:00:00.100Z",
  });
  goal = active(root);
  assert.equal("text" in goal.question, false);
  assert.doesNotMatch(JSON.stringify(goal), /Private free-form ambiguity/);
});

test("completion rejects colliding or report-mismatched independent verdict records", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const records = evidenceRecords(root, "2026-07-19T10:00:00.050Z");
  const validatorPath = join(root, records.validatorRecord);
  const validator = JSON.parse(readFileSync(validatorPath, "utf8"));
  writeFileSync(
    validatorPath,
    `${JSON.stringify({ ...validator, agentId: "fresh-verifier-fixture" })}\n`,
  );
  const rejected = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /independent-verdicts-required/);

  writeFileSync(validatorPath, `${JSON.stringify(validator)}\n`);
  writeFileSync(
    join(root, records.reviewerRecord.replace(/\.json$/, ".report.txt")),
    "PASS\ntampered\n",
  );
  const mismatched = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(mismatched.status, 0);
  assert.match(mismatched.stderr, /agent-report-mismatch/);

  writeFileSync(
    join(root, records.reviewerRecord.replace(/\.json$/, ".report.txt")),
    "PASS\nIndependent fixture evidence.\n",
  );
  writeFileSync(validatorPath, `${JSON.stringify({ ...validator, head: "0".repeat(40) })}\n`);
  const staleHead = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(staleHead.status, 0);
  assert.match(staleHead.stderr, /evidence-record-mismatch/);
});

test("owned inputs must be readable in-root files and budgets have hard maxima", () => {
  const root = mkdtempSync(join(tmpdir(), "honeymoon-invalid-goal-"));
  git(root, "init", "-q");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "Fixture");
  mkdirSync(join(root, "owned"));
  mkdirSync(join(root, "docs"));
  writeFileSync(join(root, "file.txt"), "ok\n");
  for (const name of [
    "completion.md",
    "goal.md",
    "last30days.md",
    "prohibitions.md",
    "research.md",
  ]) {
    writeFileSync(join(root, "docs", name), `${name}\n`);
  }
  symlinkSync(tmpdir(), join(root, "escape"));
  git(root, "add", "file.txt", "docs");
  git(root, "commit", "-qm", "fixture");
  const missingAuthority = command(root, "init", {
    goal: "invalid-fixture",
    objective: "missing authority",
    ownedInput: "file.txt",
  });
  assert.notEqual(missingAuthority.status, 0);
  assert.match(missingAuthority.stderr, /research-preflight-required/);
  const missingObjective = command(root, "init", {
    ...authorityOptions,
    goal: "invalid-fixture",
    objective: "missing objective artifact",
    objectiveRef: "docs/missing-objective.md",
    ownedInput: "file.txt",
  });
  assert.notEqual(missingObjective.status, 0);
  assert.match(missingObjective.stderr, /invalid-objective-ref/);
  for (const ownedInput of ["owned", "missing.txt", "escape"]) {
    rmSync(join(root, ".codex"), { recursive: true, force: true });
    const rejected = command(root, "init", {
      ...authorityOptions,
      goal: "invalid-fixture",
      objective: "invalid input",
      ownedInput,
    });
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /invalid-owned-input/);
  }
  rmSync(join(root, ".codex"), { recursive: true, force: true });
  const unbounded = command(root, "init", {
    ...authorityOptions,
    goal: "invalid-fixture",
    objective: "invalid budget",
    ownedInput: "file.txt",
    maxRuntimeMs: Number.MAX_SAFE_INTEGER,
  });
  assert.notEqual(unbounded.status, 0);
  assert.match(unbounded.stderr, /invalid-max-runtime-ms/);
});

test("an explicit transition replaces only a completed goal and preserves history", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...evidenceRecords(root, "2026-07-19T10:00:00.050Z"),
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  const previousHistoryLength = history(root).length;
  const initialized = run(root, "init", {
    ...authorityOptions,
    goal: "replacement-goal",
    objective: "Exercise the next bounded goal",
    objectiveRef: "docs/goal.md",
    ownedInput: "owned/input.txt",
    replaceComplete: true,
    now: "2026-07-19T10:00:01.000Z",
  });
  assert.equal(initialized.action, "initialized");
  assert.equal(active(root).goalId, "replacement-goal");
  const records = history(root);
  assert.equal(records.length, previousHistoryLength + 2);
  assert.equal(records.at(-2).type, "completed-goal-replaced");
  assert.equal(records.at(-2).previousGoalId, "fixture-goal");
  assert.equal(records.at(-1).type, "goal-initialized");
});

test("completion requires a fresh independent standards review and enumerated retrospective", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const records = evidenceRecords(root, "2026-07-19T10:00:00.050Z");
  const missingReview = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    reviewerRecord: undefined,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(missingReview.status, 0);
  assert.match(missingReview.stderr, /standards-review-record-required/);

  const invalidRetrospective = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "completed",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(invalidRetrospective.status, 0);
  assert.match(invalidRetrospective.stderr, /invalid-retrospective-code/);

  const retrospectivePath = join(root, records.retrospectiveRecord);
  const retrospective = JSON.parse(readFileSync(retrospectivePath, "utf8"));
  writeFileSync(
    retrospectivePath,
    `${JSON.stringify({ ...retrospective, evidenceRef: "docs/missing-retrospective.md" })}\n`,
  );
  const missingRetrospectiveEvidence = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(missingRetrospectiveEvidence.status, 0);
  assert.match(missingRetrospectiveEvidence.stderr, /invalid-retrospective-record/);
  writeFileSync(retrospectivePath, `${JSON.stringify({ ...retrospective, reasonCode: "" })}\n`);
  const missingReason = command(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...records,
    retrospectiveCode: "no-new-lesson",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(missingReason.status, 0);
  assert.match(missingReason.stderr, /invalid-retrospective-record/);
});

test("owned-input adoption advances the mandatory iteration-review baseline", () => {
  const root = createFixture();
  mkdirSync(join(root, ".agents"));
  writeFileSync(join(root, ".agents/lesson.md"), "new lesson\n");
  const adopted = run(root, "adopt-input", {
    ownedInput: ".agents/lesson.md",
    now: "2026-07-19T10:00:00.000Z",
  });
  assert.equal(adopted.action, "owned-input-adopted");
  assert.ok(active(root).revision.ownedInputs.includes(".agents/lesson.md"));
  git(root, "add", ".agents/lesson.md");
  git(root, "commit", "-qm", "track lesson");
  writeFileSync(join(root, ".agents/lesson.md"), "changed lesson\n");
  git(root, "add", ".agents/lesson.md");
  git(root, "commit", "-qm", "change lesson");
  const reconciled = run(root, "reconcile", { now: "2026-07-19T10:00:01.000Z" });
  assert.equal(reconciled.reason, "iteration-review-required");
});

test("a material revision cannot advance without a durable iteration review", () => {
  const root = createFixture();
  const priorRevision = active(root).revision.fingerprint;
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:01.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
  });
  writeFileSync(join(root, "owned/input.txt"), "revision two\n");
  git(root, "add", "owned/input.txt");
  git(root, "commit", "-qm", "unreviewed revision");
  const blocked = run(root, "reconcile", { now: "2026-07-19T10:00:02.000Z" });
  assert.equal(blocked.reason, "iteration-review-required");
  assert.equal(active(root).revision.fingerprint, priorRevision);
});

test("concurrent differing owned-input adoption preserves both paths", async () => {
  const root = createFixture();
  writeFileSync(join(root, "owned/a.txt"), "a\n");
  writeFileSync(join(root, "owned/b.txt"), "b\n");
  const delayed = runAsync(root, "adopt-input", {
    ownedInput: "owned/a.txt",
    testAdoptPrelockPauseMs: 300,
  });
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
  const first = run(root, "adopt-input", { ownedInput: "owned/b.txt" });
  assert.equal(first.action, "owned-input-adopted");
  const second = await delayed;
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.result.action, "owned-input-adopted");
  assert.ok(active(root).revision.ownedInputs.includes("owned/a.txt"));
  assert.ok(active(root).revision.ownedInputs.includes("owned/b.txt"));
});
