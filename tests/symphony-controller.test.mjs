import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
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
function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function createFixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), "honeymoon-goal-"));
  git(root, "init", "-q");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "Fixture");
  mkdirSync(join(root, "owned"), { recursive: true });
  writeFileSync(join(root, "owned/input.txt"), "revision one\n");
  git(root, "add", ".");
  git(root, "commit", "-qm", "fixture");
  run(root, "init", {
    goal: "fixture-goal",
    objective: "Exercise the bounded controller",
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

function expireMutation(root) {
  const ownerPath = join(root, ".codex/goals/.mutation/owner.json");
  const owner = JSON.parse(readFileSync(ownerPath, "utf8"));
  writeFileSync(
    ownerPath,
    `${JSON.stringify({ ...owner, expiresAt: "2000-01-01T00:00:00.000Z" })}\n`,
  );
}

function evidenceRecords(root, completedAt) {
  const directory = join(root, ".codex/goals/.evidence");
  mkdirSync(directory, { recursive: true });
  const revision = active(root).revision.fingerprint;
  const records = {
    aggregateRecord: {
      kind: "aggregate-check",
      status: "PASS",
      revision,
      completedAt,
      command: "npm run check",
    },
    protectedArtifactRecord: {
      kind: "protected-artifact-audit",
      status: "PASS",
      revision,
      completedAt,
      command: "git diff --exit-code -- shortcut dist",
    },
    validatorRecord: {
      kind: "validator",
      verdict: "PASS",
      revision,
      completedAt,
      agentId: "fresh-validator-fixture",
      fresh: true,
    },
    verifierRecord: {
      kind: "verifier",
      verdict: "ACCEPT",
      revision,
      completedAt,
      agentId: "fresh-verifier-fixture",
      fresh: true,
    },
  };
  const options = {};
  for (const [name, record] of Object.entries(records)) {
    const relative = `.codex/goals/.evidence/${name}.json`;
    writeFileSync(join(root, relative), `${JSON.stringify(record)}\n`);
    options[name] = relative;
  }
  return options;
}

function runAsync(root, action, options = {}) {
  return new Promise((resolveResult) => {
    const child = spawn("node", [controller, action, "--root", root, ...argsFor(options)], {
      env: { ...process.env, SYMPHONY_CONTROLLER_TEST_MODE: "1" },
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

test("owned-input changes fence a live lease even when HEAD is unchanged", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  writeFileSync(join(root, "owned/input.txt"), "uncommitted revision\n");
  const reconciled = run(root, "reconcile", { now: "2026-07-19T10:00:00.100Z" });
  assert.equal(reconciled.state, "blocked");
  assert.equal(reconciled.reason, "dirty-tree-conflict");
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
    retrospectiveCode: "completed",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.equal(active(root).state, "complete");
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

test("retry and repair exhaustion are terminal and explicit", () => {
  const root = createFixture({ maxRepairCycles: 0, maxRetries: 0 });
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
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
  assert.equal(exhausted.reason, "retry-budget-exhausted");
});

test("completed current revisions never run again", () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  run(root, "checkpoint", {
    ownerToken: lease.ownerToken,
    state: "complete",
    ...evidenceRecords(root, "2026-07-19T10:00:00.050Z"),
    retrospectiveCode: "completed",
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

test("startup recovers an ownerless crashed mutation lock by bounded age", () => {
  const root = createFixture();
  const mutation = join(root, ".codex/goals/.mutation");
  mkdirSync(mutation);
  utimesSync(mutation, new Date(0), new Date(0));
  const result = run(root, "reconcile", { now: "2026-07-19T10:00:00.000Z" });
  assert.equal(result.state, "ready");
  assert.equal(existsSync(mutation), false);
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
  expireMutation(root);
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
  expireMutation(root);
  const recovered = run(root, "reconcile", { now: "2026-07-19T10:00:02.000Z" });
  assert.equal(recovered.state, "ready");
  assert.equal(history(root).filter((entry) => entry.type === "checkpoint").length, 0);
});

test("mutation serialization prevents takeover during a checkpoint", async () => {
  const root = createFixture();
  const lease = run(root, "wake", { wakeToken: "one", now: "2026-07-19T10:00:00.000Z" });
  const checkpointing = runAsync(root, "checkpoint", {
    dueAt: "2026-07-19T10:00:05.000Z",
    ownerToken: lease.ownerToken,
    state: "waiting",
    now: "2026-07-19T10:00:00.100Z",
    testPauseMs: 500,
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

test("completion rejects self-attested or revision-mismatched verdict records", () => {
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
    retrospectiveCode: "completed",
    now: "2026-07-19T10:00:00.100Z",
  });
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /independent-verdicts-required/);
});

test("owned inputs must be readable in-root files and budgets have hard maxima", () => {
  const root = mkdtempSync(join(tmpdir(), "honeymoon-invalid-goal-"));
  git(root, "init", "-q");
  git(root, "config", "user.email", "fixture@example.invalid");
  git(root, "config", "user.name", "Fixture");
  mkdirSync(join(root, "owned"));
  writeFileSync(join(root, "file.txt"), "ok\n");
  symlinkSync(tmpdir(), join(root, "escape"));
  git(root, "add", "file.txt");
  git(root, "commit", "-qm", "fixture");
  for (const ownedInput of ["owned", "missing.txt", "escape"]) {
    rmSync(join(root, ".codex"), { recursive: true, force: true });
    const rejected = command(root, "init", {
      goal: "invalid-fixture",
      objective: "invalid input",
      ownedInput,
    });
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /invalid-owned-input/);
  }
  rmSync(join(root, ".codex"), { recursive: true, force: true });
  const unbounded = command(root, "init", {
    goal: "invalid-fixture",
    objective: "invalid budget",
    ownedInput: "file.txt",
    maxRuntimeMs: Number.MAX_SAFE_INTEGER,
  });
  assert.notEqual(unbounded.status, 0);
  assert.match(unbounded.stderr, /invalid-max-runtime-ms/);
});
