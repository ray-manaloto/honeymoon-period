#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const states = new Set(["ready", "running", "waiting", "blocked", "failed", "complete"]);

class ControllerError extends Error {}

function fail(reason) {
  throw new ControllerError(reason);
}

function parseArguments(argv) {
  const [action, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    if (!flag?.startsWith("--") || rest[index + 1] === undefined) fail("invalid-arguments");
    const key = flag.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = rest[index + 1];
    if (key === "ownedInput") {
      options.ownedInput ??= [];
      options.ownedInput.push(value);
    } else {
      options[key] = value;
    }
  }
  return { action, options };
}

function git(root, args, trim = true) {
  try {
    const output = execFileSync("git", args, { cwd: root, encoding: "utf8" });
    return trim ? output.trim() : output;
  } catch {
    fail("git-state-unavailable");
  }
}

function paths(root) {
  const directory = join(root, ".codex/goals");
  return {
    active: join(directory, "active.json"),
    directory,
    history: join(directory, "history.jsonl"),
    lease: join(directory, ".lease"),
  };
}

function questionDirectory(root, fingerprint) {
  return join(paths(root).directory, `.question-${fingerprint}`);
}

function atomicJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${randomUUID()}`;
  const descriptor = openSync(temporary, "wx", 0o600);
  try {
    writeFileSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  renameSync(temporary, path);
  fsyncParent(path);
}

function fsyncParent(path) {
  const directory = openSync(dirname(path), "r");
  try {
    fsyncSync(directory);
  } finally {
    closeSync(directory);
  }
}

function appendEvent(path, event) {
  mkdirSync(dirname(path), { recursive: true });
  const descriptor = openSync(path, "a", 0o600);
  try {
    appendFileSync(descriptor, `${JSON.stringify(event)}\n`);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function readJson(path, missingReason) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    fail(missingReason);
  }
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function redact(value) {
  return String(value ?? "")
    .replace(/https?:\/\/[^\s]+/gi, "[REDACTED URL]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED EMAIL]")
    .replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "[REDACTED AUTH]")
    .replace(/\b(?:Cookie|Set-Cookie):[^\n]+/gi, "[REDACTED COOKIE]")
    .replace(/([?&](?:token|key|secret|password)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/\b(?:API_KEY|TOKEN|SECRET|PASSWORD)\s*=\s*[^\s]+/gi, "[REDACTED]")
    .replace(/-----BEGIN[\s\S]*?-----END[^-]*-----/g, "[REDACTED PRIVATE MATERIAL]")
    .replace(/\/Users\/[^/\s]+/g, "/Users/[REDACTED]")
    .slice(0, 1_000);
}

function safeReference(value, name) {
  const reference = String(value ?? "");
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._/#-]{0,199}$/.test(reference) ||
    reference.startsWith("/") ||
    reference.includes("..")
  ) {
    fail(`invalid-${name}`);
  }
  return reference;
}

function boundedNumber(value, name, { maximum = 100, minimum = 0 } = {}) {
  const number = Number(value);
  if (
    !Number.isFinite(number) ||
    !Number.isInteger(number) ||
    number < minimum ||
    number > maximum
  ) {
    fail(`invalid-${name}`);
  }
  return number;
}

function manifest(root, inputs) {
  const entries = [];
  for (const input of inputs) {
    const absolute = resolve(root, input);
    if (!absolute.startsWith(`${root}/`) && absolute !== root) fail("owned-input-outside-root");
    try {
      const metadata = lstatSync(absolute);
      const target = metadata.isSymbolicLink() ? realpathSync(absolute) : absolute;
      if (!target.startsWith(`${root}/`) || !lstatSync(target).isFile()) {
        fail("invalid-owned-input");
      }
      entries.push(`${input}:\0${hash(readFileSync(target))}`);
    } catch {
      fail("invalid-owned-input");
    }
  }
  return hash(entries.sort().join("\n"));
}

function authorityHead(root) {
  const commits = git(root, ["log", "--format=%H"]).split("\n");
  for (const commit of commits) {
    const changed = git(root, [
      "diff-tree",
      "--root",
      "--no-commit-id",
      "--name-only",
      "-r",
      commit,
    ])
      .split("\n")
      .filter(Boolean);
    if (
      changed.some(
        (path) => path !== ".codex/goals/active.json" && path !== ".codex/goals/history.jsonl",
      )
    ) {
      return commit;
    }
  }
  return git(root, ["rev-parse", "HEAD"]);
}

function revision(root, goal) {
  const head = authorityHead(root);
  const worktree = realpathSync(root);
  const ownedManifest = manifest(root, goal.revision.ownedInputs);
  return {
    fingerprint: hash(`${hash(worktree)}\0${head}\0${ownedManifest}`),
    head,
    ownedManifest,
    ownedInputs: goal.revision.ownedInputs,
    worktreeFingerprint: hash(worktree),
  };
}

function dirtyConflicts(root) {
  const output = git(root, ["status", "--porcelain=v1", "-z"], false);
  if (!output) return [];
  return output
    .split("\0")
    .filter(Boolean)
    .map((entry) => entry.slice(3))
    .filter(
      (path) =>
        path !== ".codex/goals/active.json" &&
        path !== ".codex/goals/history.jsonl" &&
        !path.startsWith(".codex/goals/.lease") &&
        !path.startsWith(".codex/goals/.mutation") &&
        !path.startsWith(".codex/goals/.evidence") &&
        !path.startsWith(".codex/goals/.question-"),
    );
}

function nowFrom(options) {
  const now = new Date(options.now ?? Date.now());
  if (Number.isNaN(now.valueOf())) fail("invalid-now");
  return now;
}

function testPause(options) {
  if (process.env.SYMPHONY_CONTROLLER_TEST_MODE !== "1" || !options.testPauseMs) return;
  const duration = boundedNumber(options.testPauseMs, "test-pause-ms", {
    maximum: 5_000,
    minimum: 1,
  });
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration);
}

function testCrash(options, phase) {
  if (process.env.SYMPHONY_CONTROLLER_TEST_MODE === "1" && options.testCrashAfter === phase) {
    process.exit(86);
  }
}

function event(goal, now, type, details = {}) {
  return {
    at: now.toISOString(),
    goalId: goal.goalId,
    revision: goal.revision.fingerprint,
    type,
    ...details,
  };
}

function withMutationLock(root, callback) {
  const lock = join(paths(root).directory, ".mutation");
  const acquire = () => {
    try {
      mkdirSync(lock, { mode: 0o700 });
      atomicJson(join(lock, "owner.json"), {
        expiresAt: new Date(Date.now() + 30_000).toISOString(),
        token: randomUUID(),
      });
      return true;
    } catch {
      try {
        const owner = JSON.parse(readFileSync(join(lock, "owner.json"), "utf8"));
        if (Date.parse(owner.expiresAt) <= Date.now()) {
          const stale = `${lock}.stale-${randomUUID()}`;
          renameSync(lock, stale);
          fsyncParent(lock);
          rmSync(stale, { recursive: true });
          return acquire();
        }
      } catch {
        try {
          if (Date.now() - statSync(lock).mtimeMs > 30_000) {
            const stale = `${lock}.stale-${randomUUID()}`;
            renameSync(lock, stale);
            fsyncParent(lock);
            rmSync(stale, { recursive: true });
            return acquire();
          }
        } catch {
          // A concurrent reconciler may already have recovered it.
        }
      }
      return false;
    }
  };
  if (!acquire()) return null;
  try {
    return callback();
  } finally {
    rmSync(lock, { recursive: true });
    fsyncParent(lock);
  }
}

function leaseExpiry(root, lease) {
  try {
    const renewal = JSON.parse(readFileSync(join(paths(root).lease, "renewal.json"), "utf8"));
    if (renewal.ownerToken === lease.ownerToken && renewal.epoch === lease.epoch) {
      return renewal.expiresAt;
    }
  } catch {
    // The immutable owner expiry remains authoritative without a valid renewal.
  }
  return lease.expiresAt;
}

function fenceLease(root, goal, now, reason) {
  const controllerPaths = paths(root);
  if (!existsSync(controllerPaths.lease)) return false;
  const fenced = `${controllerPaths.lease}.stale-${randomUUID()}`;
  try {
    renameSync(controllerPaths.lease, fenced);
    fsyncParent(controllerPaths.lease);
  } catch {
    return false;
  }
  appendEvent(controllerPaths.history, event(goal, now, "stale-lease-reconciled", { reason }));
  rmSync(fenced, { recursive: true });
  fsyncParent(fenced);
  return true;
}

function reconcile(root, goal, now) {
  const locked = withMutationLock(root, () => reconcileLocked(root, goal, now));
  return locked ?? { action: "noop", reason: "mutation-contention", state: goal.state };
}

function reconcileLocked(root, goal, now) {
  const controllerPaths = paths(root);
  const residues = readdirSync(controllerPaths.directory).filter(
    (name) =>
      name.startsWith(".lease.stale-") ||
      name.startsWith(".lease.released-") ||
      name.startsWith(".mutation.stale-"),
  );
  for (const residue of residues)
    rmSync(join(controllerPaths.directory, residue), { recursive: true });
  if (residues.length > 0) {
    appendEvent(
      controllerPaths.history,
      event(goal, now, "lease-residue-reconciled", { count: residues.length }),
    );
  }
  if (existsSync(controllerPaths.lease)) reconcileCheckpointJournal(root, goal);
  if (existsSync(controllerPaths.lease)) {
    let lease;
    try {
      lease = JSON.parse(readFileSync(join(controllerPaths.lease, "owner.json"), "utf8"));
    } catch {
      const age = now.valueOf() - statSync(controllerPaths.lease).mtimeMs;
      if (age > goal.policy.ttlMs) fenceLease(root, goal, now, "incomplete-lease");
      else return { action: "noop", reason: "lease-initializing", state: goal.state };
    }
    if (lease) {
      const expired = Date.parse(leaseExpiry(root, lease)) <= now.valueOf();
      const timedOut = goal.run?.deadlineAt && Date.parse(goal.run.deadlineAt) <= now.valueOf();
      const foreign =
        lease.worktree !== realpathSync(root) ||
        lease.head !== git(root, ["rev-parse", "HEAD"]) ||
        lease.manifest !== manifest(root, goal.revision.ownedInputs);
      const authorityLost =
        goal.state !== "running" ||
        lease.epoch !== goal.leaseEpoch ||
        lease.ownerToken !== goal.run?.ownerToken;
      if (expired || timedOut || foreign || authorityLost) {
        fenceLease(
          root,
          goal,
          now,
          timedOut
            ? "time-budget-exhausted"
            : expired
              ? "ttl-expired"
              : foreign
                ? "revision-lost"
                : "run-authority-lost",
        );
        if (timedOut) {
          goal.state = "failed";
          goal.reason = "time-budget-exhausted";
          goal.run = null;
          atomicJson(controllerPaths.active, goal);
        } else if (goal.state === "running") {
          goal.state = "ready";
          goal.run = null;
          atomicJson(controllerPaths.active, goal);
        }
      } else {
        return { action: "noop", reason: "lease-held", state: goal.state };
      }
    }
  } else if (goal.state === "running") {
    goal.state = "ready";
    goal.reason = "lease-missing-after-restart";
    goal.run = null;
    atomicJson(controllerPaths.active, goal);
    appendEvent(controllerPaths.history, event(goal, now, "missing-lease-reconciled"));
  }

  const current = revision(root, goal);
  if (goal.revision.fingerprint !== current.fingerprint) {
    const invalidated = goal.evidence.current.length;
    goal.revision = current;
    goal.evidence.current = [];
    goal.question = null;
    goal.run = null;
    goal.state = "ready";
    goal.reason = "revision-changed";
    appendEvent(
      controllerPaths.history,
      event(goal, now, "evidence-invalidated", { count: invalidated }),
    );
    atomicJson(controllerPaths.active, goal);
  }

  const conflicts = dirtyConflicts(root);
  if (conflicts.length > 0) {
    goal.state = "blocked";
    goal.reason = "dirty-tree-conflict";
    goal.question = null;
    atomicJson(controllerPaths.active, goal);
    appendEvent(
      controllerPaths.history,
      event(goal, now, "dirty-tree-conflict", {
        pathFingerprints: conflicts.map((path) => hash(path)).slice(0, 20),
      }),
    );
    return { action: "noop", reason: goal.reason, state: goal.state };
  }

  return { action: "reconciled", reason: goal.reason ?? null, state: goal.state };
}

function acquire(root, goal, now, wakeToken) {
  const locked = withMutationLock(root, () => acquireLocked(root, goal, now, wakeToken));
  return locked ?? null;
}

function acquireLocked(root, goal, now, wakeToken) {
  const controllerPaths = paths(root);
  try {
    mkdirSync(controllerPaths.lease, { mode: 0o700 });
  } catch {
    return null;
  }
  const ownerToken = randomUUID();
  const epoch = goal.leaseEpoch + 1;
  const expiresAt = new Date(now.valueOf() + goal.policy.ttlMs).toISOString();
  const lease = {
    epoch,
    expiresAt,
    head: git(root, ["rev-parse", "HEAD"]),
    manifest: goal.revision.ownedManifest,
    ownerToken,
    worktree: realpathSync(root),
  };
  try {
    atomicJson(join(controllerPaths.lease, "owner.json"), lease);
    goal.leaseEpoch = epoch;
    goal.state = "running";
    goal.reason = null;
    goal.lastWakeToken = wakeToken;
    goal.budgets.runsUsed += 1;
    goal.run = {
      deadlineAt: new Date(now.valueOf() + goal.policy.maxRuntimeMs).toISOString(),
      directChildrenUsed: 0,
      ownerToken,
      startedAt: now.toISOString(),
    };
    atomicJson(controllerPaths.active, goal);
    appendEvent(
      controllerPaths.history,
      event(goal, now, "run-started", { epoch, wakeToken: hash(wakeToken) }),
    );
    return { action: "run", ownerToken, state: goal.state };
  } catch (error) {
    rmSync(controllerPaths.lease, { recursive: true });
    throw error;
  }
}

function assertLease(root, goal, ownerToken, now) {
  const controllerPaths = paths(root);
  let lease;
  try {
    lease = JSON.parse(readFileSync(join(controllerPaths.lease, "owner.json"), "utf8"));
  } catch {
    fail("lease-lost");
  }
  const current = revision(root, goal);
  if (
    lease.ownerToken !== ownerToken ||
    lease.epoch !== goal.leaseEpoch ||
    Date.parse(leaseExpiry(root, lease)) <= now.valueOf() ||
    lease.worktree !== realpathSync(root) ||
    lease.head !== git(root, ["rev-parse", "HEAD"]) ||
    lease.manifest !== current.ownedManifest
  ) {
    fail("lease-lost");
  }
  return lease;
}

function release(root, ownerToken) {
  const controllerPaths = paths(root);
  const lease = readJson(join(controllerPaths.lease, "owner.json"), "lease-lost");
  if (lease.ownerToken !== ownerToken) fail("lease-lost");
  const released = `${controllerPaths.lease}.released-${randomUUID()}`;
  renameSync(controllerPaths.lease, released);
  fsyncParent(controllerPaths.lease);
  rmSync(released, { recursive: true });
  fsyncParent(released);
}

function replayCheckpointHistory(root, journal) {
  const historyPath = paths(root).history;
  const existing = new Set();
  if (existsSync(historyPath)) {
    for (const line of readFileSync(historyPath, "utf8").split("\n").filter(Boolean)) {
      try {
        const recorded = JSON.parse(line);
        if (recorded.checkpointId === journal.checkpointId) existing.add(recorded.eventIndex);
      } catch {
        fail("invalid-history-record");
      }
    }
  }
  journal.events.forEach((recorded, eventIndex) => {
    if (!existing.has(eventIndex)) {
      appendEvent(historyPath, { ...recorded, checkpointId: journal.checkpointId, eventIndex });
    }
  });
}

function reconcileCheckpointJournal(root, goal) {
  const journalPath = join(paths(root).lease, "checkpoint.json");
  if (!existsSync(journalPath)) return false;
  const journal = readJson(journalPath, "invalid-checkpoint-journal");
  const lease = readJson(join(paths(root).lease, "owner.json"), "lease-lost");
  if (
    goal.lastCheckpointId !== journal.checkpointId ||
    journal.ownerToken !== lease.ownerToken ||
    journal.epoch !== lease.epoch
  ) {
    return false;
  }
  replayCheckpointHistory(root, journal);
  release(root, lease.ownerToken);
  return true;
}

function renew(root, goal, options, now) {
  const locked = withMutationLock(root, () => renewLocked(root, goal, options, now));
  if (!locked) fail("mutation-contention");
  return locked;
}

function renewLocked(root, goal, options, now) {
  const lease = assertLease(root, goal, options.ownerToken, now);
  testPause(options);
  if (!goal.run?.deadlineAt || Date.parse(goal.run.deadlineAt) <= now.valueOf()) {
    fail("time-budget-exhausted");
  }
  const renewed = {
    epoch: lease.epoch,
    expiresAt: new Date(now.valueOf() + goal.policy.ttlMs).toISOString(),
    ownerToken: lease.ownerToken,
  };
  atomicJson(join(paths(root).lease, "renewal.json"), renewed);
  appendEvent(
    paths(root).history,
    event(goal, now, "lease-renewed", { epoch: lease.epoch, expiresAt: renewed.expiresAt }),
  );
  return { action: "renewed", expiresAt: renewed.expiresAt, state: goal.state };
}

function initialize(root, options, now) {
  const controllerPaths = paths(root);
  if (existsSync(controllerPaths.active)) fail("active-goal-already-exists");
  mkdirSync(controllerPaths.directory, { recursive: true });
  const ownedInputs = options.ownedInput ?? [];
  if (ownedInputs.length === 0) fail("owned-input-required");
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(options.goal ?? "")) fail("invalid-goal-id");
  const objective = redact(options.objective);
  const goal = {
    schemaVersion: 1,
    goalId: options.goal,
    objectiveFingerprint: hash(objective),
    objectiveRef: safeReference(options.objectiveRef ?? "delegated-goal", "objective-ref"),
    state: "ready",
    reason: null,
    revision: { ownedInputs },
    leaseEpoch: 0,
    lastWakeToken: null,
    question: null,
    run: null,
    evidence: { current: [] },
    budgets: {
      repairCyclesUsed: 0,
      retriesUsed: 0,
      runsUsed: 0,
    },
    policy: {
      maxDirectChildren: boundedNumber(options.maxDirectChildren ?? 2, "max-direct-children", {
        maximum: 3,
      }),
      maxRepairCycles: boundedNumber(options.maxRepairCycles ?? 1, "max-repair-cycles", {
        maximum: 20,
      }),
      maxRetries: boundedNumber(options.maxRetries ?? 2, "max-retries", { maximum: 20 }),
      maxRuntimeMs: boundedNumber(options.maxRuntimeMs ?? 1_800_000, "max-runtime-ms", {
        maximum: 86_400_000,
        minimum: 1,
      }),
      ttlMs: boundedNumber(options.ttlMs ?? 120_000, "ttl-ms", {
        maximum: 86_400_000,
        minimum: 1,
      }),
    },
  };
  goal.revision = revision(root, goal);
  atomicJson(controllerPaths.active, goal);
  appendEvent(controllerPaths.history, event(goal, now, "goal-initialized"));
  return { action: "initialized", state: goal.state };
}

function wake(root, goal, options, now) {
  const wakeToken = options.wakeToken;
  if (!wakeToken) fail("wake-token-required");
  const result = reconcile(root, goal, now);
  goal = readJson(paths(root).active, "active-goal-missing");
  if (
    result.reason === "dirty-tree-conflict" ||
    result.reason === "lease-initializing" ||
    result.reason === "mutation-contention"
  ) {
    return result;
  }
  if (goal.lastWakeToken === wakeToken) {
    return { action: "noop", reason: "duplicate-wakeup", state: goal.state };
  }
  if (goal.state === "complete")
    return { action: "noop", reason: "goal-complete", state: goal.state };
  if (goal.state === "blocked" && goal.question) {
    if (goal.question.emitted) {
      return {
        action: "noop",
        reason: "blocked-question-already-emitted",
        state: goal.state,
      };
    }
    const directory = questionDirectory(root, goal.question.fingerprint);
    const claim = join(directory, "emission.json");
    try {
      const descriptor = openSync(claim, "wx", 0o600);
      try {
        writeFileSync(
          descriptor,
          `${JSON.stringify({ claimedAt: now.toISOString(), fingerprint: goal.question.fingerprint })}\n`,
        );
        fsyncSync(descriptor);
      } finally {
        closeSync(descriptor);
      }
    } catch {
      try {
        const claimed = JSON.parse(readFileSync(claim, "utf8"));
        if (
          !goal.question.emitted &&
          now.valueOf() - Date.parse(claimed.claimedAt) > goal.policy.ttlMs
        ) {
          rmSync(claim);
          return wake(root, goal, options, now);
        }
      } catch {
        // A concurrent claim is still initializing.
      }
      return {
        action: "noop",
        reason: goal.question.emitted
          ? "blocked-question-already-emitted"
          : "question-emission-in-progress",
        state: goal.state,
      };
    }
    const runtimeQuestion = readJson(join(directory, "question.json"), "question-text-unavailable");
    goal.question.emitted = true;
    atomicJson(paths(root).active, goal);
    return { action: "ask", question: runtimeQuestion.text, state: goal.state };
  }
  if (result.reason === "lease-held") return result;
  if (goal.state === "waiting" && goal.waiting?.dueAt) {
    if (Date.parse(goal.waiting.dueAt) > now.valueOf()) {
      return { action: "noop", reason: "waiting-not-due", state: goal.state };
    }
    goal.waiting = null;
  }
  if (goal.state === "failed") {
    if (goal.reason === "unchanged-failure") {
      return { action: "noop", reason: goal.reason, state: goal.state };
    }
    if (goal.budgets.retriesUsed >= goal.policy.maxRetries) {
      goal.reason = "retry-budget-exhausted";
      atomicJson(paths(root).active, goal);
      return { action: "noop", reason: goal.reason, state: goal.state };
    }
    if (goal.retryDueAt && Date.parse(goal.retryDueAt) > now.valueOf()) {
      return { action: "noop", reason: "retry-not-due", state: goal.state };
    }
    goal.budgets.retriesUsed += 1;
  }
  const acquired = acquire(root, goal, now, wakeToken);
  return acquired ?? { action: "noop", reason: "lease-contention", state: goal.state };
}

function loadEvidenceRecord(root, recordPath, expected, goal, now) {
  if (!recordPath) fail(`${expected.kind}-record-required`);
  const absolute = resolve(root, recordPath);
  if (!absolute.startsWith(`${root}/`)) fail("evidence-record-outside-root");
  let content;
  let record;
  try {
    if (!lstatSync(absolute).isFile()) fail("invalid-evidence-record");
    content = readFileSync(absolute, "utf8");
    record = JSON.parse(content);
  } catch {
    fail("invalid-evidence-record");
  }
  if (
    record.kind !== expected.kind ||
    record[expected.field] !== expected.value ||
    record.revision !== goal.revision.fingerprint
  ) {
    fail("evidence-record-mismatch");
  }
  const completedAt = Date.parse(record.completedAt);
  if (
    !Number.isFinite(completedAt) ||
    completedAt < Date.parse(goal.run.startedAt) ||
    completedAt > now.valueOf()
  ) {
    fail("stale-evidence-record");
  }
  return { contentHash: hash(content), record };
}

function checkpoint(root, goal, options, now) {
  const locked = withMutationLock(root, () => checkpointLocked(root, goal, options, now));
  if (!locked) fail("mutation-contention");
  return locked;
}

function checkpointLocked(root, goal, options, now) {
  if (!states.has(options.state) || options.state === "ready" || options.state === "running") {
    fail("invalid-checkpoint-state");
  }
  const lease = assertLease(root, goal, options.ownerToken, now);
  testPause(options);
  const directChildren = boundedNumber(options.directChildren ?? 0, "direct-children");
  if (directChildren > goal.policy.maxDirectChildren) fail("direct-child-budget-exhausted");
  goal.run.directChildrenUsed = directChildren;
  let reason = null;
  const details = { state: options.state };
  const extraEvents = [];

  if (options.state === "complete") {
    if (options.retrospectiveCode !== "completed") fail("invalid-retrospective-code");
    const verifier = loadEvidenceRecord(
      root,
      options.verifierRecord,
      { field: "verdict", kind: "verifier", value: "ACCEPT" },
      goal,
      now,
    );
    const validator = loadEvidenceRecord(
      root,
      options.validatorRecord,
      { field: "verdict", kind: "validator", value: "PASS" },
      goal,
      now,
    );
    if (
      !verifier.record.agentId ||
      !validator.record.agentId ||
      verifier.record.agentId === validator.record.agentId ||
      verifier.record.fresh !== true ||
      validator.record.fresh !== true
    ) {
      fail("independent-verdicts-required");
    }
    const aggregate = loadEvidenceRecord(
      root,
      options.aggregateRecord,
      { field: "status", kind: "aggregate-check", value: "PASS" },
      goal,
      now,
    );
    const protectedArtifacts = loadEvidenceRecord(
      root,
      options.protectedArtifactRecord,
      { field: "status", kind: "protected-artifact-audit", value: "PASS" },
      goal,
      now,
    );
    const evidence = {
      aggregateRecordHash: aggregate.contentHash,
      at: now.toISOString(),
      protectedArtifactRecordHash: protectedArtifacts.contentHash,
      revision: goal.revision.fingerprint,
      validatorAgent: hash(validator.record.agentId),
      validatorRecordHash: validator.contentHash,
      validatorVerdict: "PASS",
      verifierAgent: hash(verifier.record.agentId),
      verifierRecordHash: verifier.contentHash,
      verifierVerdict: "ACCEPT",
    };
    goal.evidence.current.push(evidence);
    details.retrospectiveCode = "completed";
    extraEvents.push(event(goal, now, "completion-evidence", evidence));
  }

  if (options.state === "blocked") {
    if (!options.question) fail("blocked-question-required");
    const text = redact(options.question);
    const fingerprint = hash(text.toLowerCase().replace(/\s+/g, " ").trim());
    if (goal.question?.fingerprint !== fingerprint) {
      const directory = questionDirectory(root, fingerprint);
      mkdirSync(directory, { mode: 0o700, recursive: true });
      atomicJson(join(directory, "question.json"), { fingerprint, text });
      goal.question = { emitted: false, fingerprint };
      extraEvents.push(event(goal, now, "operator-question", { fingerprint }));
    }
  } else {
    goal.question = null;
  }

  if (options.state === "waiting") {
    const dueAt = new Date(options.dueAt ?? now.valueOf() + 1_000);
    if (Number.isNaN(dueAt.valueOf()) || dueAt.valueOf() <= now.valueOf()) {
      fail("invalid-waiting-due-at");
    }
    goal.waiting = {
      dueAt: dueAt.toISOString(),
      reasonCode: safeReference(options.waitReason ?? "backoff", "wait-reason"),
    };
    details.dueAt = goal.waiting.dueAt;
  } else {
    goal.waiting = null;
  }

  if (options.state === "failed") {
    if (!options.failureFingerprint) fail("failure-fingerprint-required");
    const fingerprint = hash(redact(options.failureFingerprint));
    if (goal.failureFingerprint === fingerprint) {
      reason = "unchanged-failure";
      goal.retryDueAt = null;
    } else {
      const repair = boundedNumber(options.repair ?? 0, "repair");
      if (goal.budgets.repairCyclesUsed + repair > goal.policy.maxRepairCycles) {
        reason = "repair-budget-exhausted";
        goal.retryDueAt = null;
      } else {
        goal.budgets.repairCyclesUsed += repair;
        const backoffMs = Math.min(2 ** goal.budgets.retriesUsed * 1_000, 60_000);
        goal.retryDueAt = new Date(now.valueOf() + backoffMs).toISOString();
      }
      goal.failureFingerprint = fingerprint;
    }
    details.failureFingerprint = fingerprint;
  }

  goal.state = options.state;
  goal.reason = reason;
  goal.run = null;
  assertLease(root, readJson(paths(root).active, "active-goal-missing"), options.ownerToken, now);
  const checkpointId = randomUUID();
  goal.lastCheckpointId = checkpointId;
  const journal = {
    checkpointId,
    epoch: lease.epoch,
    events: [...extraEvents, event(goal, now, "checkpoint", { ...details, reason })],
    ownerToken: lease.ownerToken,
  };
  atomicJson(join(paths(root).lease, "checkpoint.json"), journal);
  testCrash(options, "journal");
  atomicJson(paths(root).active, goal);
  testCrash(options, "active");
  replayCheckpointHistory(root, journal);
  testCrash(options, "history");
  release(root, options.ownerToken);
  return { action: "checkpointed", reason, state: goal.state };
}

try {
  const { action, options } = parseArguments(process.argv.slice(2));
  const root = realpathSync(resolve(options.root ?? "."));
  const now = nowFrom(options);

  let result;
  if (action === "init") {
    result = initialize(root, options, now);
  } else {
    const goal = readJson(paths(root).active, "active-goal-missing");
    if (action === "reconcile") result = reconcile(root, goal, now);
    else if (action === "wake") result = wake(root, goal, options, now);
    else if (action === "renew") result = renew(root, goal, options, now);
    else if (action === "checkpoint") result = checkpoint(root, goal, options, now);
    else fail("unknown-action");
  }

  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  if (error instanceof ControllerError) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
