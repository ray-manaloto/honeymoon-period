#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fstatSync,
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
import { pathToFileURL } from "node:url";

const states = new Set(["ready", "running", "waiting", "blocked", "failed", "complete"]);
const retrospectiveCodes = new Set(["promoted", "linked", "no-new-lesson"]);
const researchStatuses = new Set(["linked", "not needed", "reused"]);
const directChildRoles = new Set([
  "implementation",
  "research",
  "review",
  "standards-review",
  "validator",
  "verifier",
]);

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

function replayTransition(root) {
  const transactionPath = join(paths(root).directory, ".transaction.json");
  if (!existsSync(transactionPath)) return;
  const transaction = readJson(transactionPath, "invalid-transition-journal");
  if (!transaction.id || !Array.isArray(transaction.writes) || !Array.isArray(transaction.events)) {
    fail("invalid-transition-journal");
  }
  for (const write of transaction.writes) {
    const target = resolve(paths(root).directory, write.target);
    if (!target.startsWith(`${paths(root).directory}/`)) fail("invalid-transition-journal");
    atomicJson(target, write.value);
  }
  const existing = new Set();
  if (existsSync(paths(root).history)) {
    for (const line of readFileSync(paths(root).history, "utf8").split("\n").filter(Boolean)) {
      const recorded = JSON.parse(line);
      if (recorded.transactionId === transaction.id) existing.add(recorded.eventIndex);
    }
  }
  transaction.events.forEach((recorded, eventIndex) => {
    if (!existing.has(eventIndex)) {
      appendEvent(paths(root).history, {
        ...recorded,
        eventIndex,
        transactionId: transaction.id,
      });
    }
  });
  rmSync(transactionPath);
  fsyncParent(transactionPath);
}

function commitTransition(root, writes, events, options = {}) {
  const transactionPath = join(paths(root).directory, ".transaction.json");
  atomicJson(transactionPath, {
    events,
    id: randomUUID(),
    writes: writes.map(({ target, value }) => ({ target, value })),
  });
  testCrash(options, "transition-journal");
  const transaction = readJson(transactionPath, "invalid-transition-journal");
  for (const write of transaction.writes) {
    atomicJson(join(paths(root).directory, write.target), write.value);
  }
  testCrash(options, "transition-state");
  replayTransition(root);
  testCrash(options, "transition-history");
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

function existingReference(root, value, name) {
  const reference = safeReference(value, name);
  const [fileReference, fragment] = reference.split("#", 2);
  const path = resolve(root, fileReference);
  if (!path.startsWith(`${root}/`)) fail(`invalid-${name}`);
  try {
    if (!lstatSync(path).isFile()) fail(`invalid-${name}`);
  } catch {
    fail(`invalid-${name}`);
  }
  if (fragment !== undefined) {
    if (!fileReference.endsWith(".md") || !fragment) fail(`invalid-${name}`);
    const occurrences = new Map();
    const anchors = new Set();
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/)?.[1];
      if (!heading) continue;
      const base = heading
        .replace(/<[^>]*>/g, "")
        .replace(/[`*_~]/g, "")
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-");
      if (!base) continue;
      const occurrence = occurrences.get(base) ?? 0;
      anchors.add(occurrence === 0 ? base : `${base}-${occurrence}`);
      occurrences.set(base, occurrence + 1);
    }
    if (!anchors.has(fragment)) fail(`invalid-${name}`);
  }
  return reference;
}

function safeOwnedInput(value) {
  const input = String(value ?? "");
  if (
    !/^[A-Za-z0-9._/-]{1,200}$/.test(input) ||
    input.startsWith("/") ||
    input.endsWith("/") ||
    input.split("/").includes("..")
  ) {
    fail("invalid-owned-input");
  }
  return input;
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

function authorityFromOptions(root, options) {
  const researchStatus = String(options.researchStatus ?? "");
  const last30daysStatus = String(options.last30daysStatus ?? "");
  if (!researchStatuses.has(researchStatus) || !researchStatuses.has(last30daysStatus)) {
    fail("research-preflight-required");
  }
  const externalCompletion = String(options.externalCompletion ?? "");
  if (!new Set(["not-required", "required"]).has(externalCompletion)) {
    fail("invalid-external-completion");
  }
  if (researchStatus === "not needed") safeReference(options.researchReason, "research-reason");
  if (last30daysStatus === "not needed") {
    safeReference(options.last30daysReason, "last30days-reason");
  }
  return {
    branch: git(root, ["branch", "--show-current"]),
    completionContractRef: existingReference(
      root,
      options.completionContractRef,
      "completion-contract-ref",
    ),
    externalCompletion,
    last30days: {
      evidenceRef: existingReference(root, options.last30daysRef, "last30days-ref"),
      reasonCode:
        last30daysStatus === "not needed"
          ? safeReference(options.last30daysReason, "last30days-reason")
          : null,
      status: last30daysStatus,
    },
    prohibitedActionsRef: existingReference(
      root,
      options.prohibitedActionsRef,
      "prohibited-actions-ref",
    ),
    research: {
      evidenceRef: existingReference(root, options.researchRef, "research-ref"),
      reasonCode:
        researchStatus === "not needed"
          ? safeReference(options.researchReason, "research-reason")
          : null,
      status: researchStatus,
    },
  };
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
  const branch = git(root, ["branch", "--show-current"]);
  const worktree = realpathSync(root);
  const ownedManifest = manifest(root, goal.revision.ownedInputs);
  const researchAuthority = hash(
    JSON.stringify({
      last30days: goal.authority.last30days,
      research: goal.authority.research,
    }),
  );
  return {
    branch,
    fingerprint: hash(
      `${hash(worktree)}\0${branch}\0${head}\0${ownedManifest}\0${researchAuthority}`,
    ),
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
        !path.startsWith(".codex/goals/.evidence") &&
        !path.startsWith(".codex/goals/.question-"),
    );
}

const productionRuntime = Object.freeze({
  adoptPrelockPause() {},
  crash() {},
  now(options) {
    if (options.now) fail("injected-time-forbidden");
    return Date.now();
  },
  pause() {},
  questionPrelockPause() {},
});
let runtimeHooks = productionRuntime;

function nowFrom(options) {
  const now = new Date(runtimeHooks.now(options));
  if (Number.isNaN(now.valueOf())) fail("invalid-now");
  return now;
}

function testPause(options) {
  runtimeHooks.pause(options);
}

function testCrash(options, phase) {
  runtimeHooks.crash(options, phase);
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

function revisionRequiresReview(root, revisionFingerprint) {
  if (!existsSync(paths(root).history)) return false;
  return readFileSync(paths(root).history, "utf8")
    .split("\n")
    .filter(Boolean)
    .some((line) => {
      const recorded = JSON.parse(line);
      return (
        recorded.revision === revisionFingerprint &&
        new Set(["goal-initialized", "owned-input-adopted", "run-started"]).has(recorded.type)
      );
    });
}

let mutationLockVerified = false;

function delegateUnderMutationLock(root, action, options) {
  const gitLock = git(root, ["rev-parse", "--git-path", "symphony-controller.lock"]);
  const lockPath = resolve(root, gitLock);
  if (options.mutationLockFd !== undefined) {
    const descriptor = boundedNumber(options.mutationLockFd, "mutation-lock-fd", {
      maximum: 1_024,
      minimum: 3,
    });
    let descriptorMetadata;
    let lockMetadata;
    try {
      descriptorMetadata = fstatSync(descriptor);
      lockMetadata = statSync(lockPath);
    } catch {
      fail("mutation-lock-not-held");
    }
    if (
      descriptorMetadata.dev !== lockMetadata.dev ||
      descriptorMetadata.ino !== lockMetadata.ino
    ) {
      fail("mutation-lock-not-held");
    }
    const verified = spawnSync(
      "python3",
      [join(import.meta.dirname, "mutation-lock.py"), "--verify", lockPath],
      { stdio: ["ignore", "ignore", "ignore", descriptor] },
    );
    if (verified.status !== 0) fail("mutation-lock-not-held");
    mutationLockVerified = true;
    return;
  }
  const result = spawnSync(
    "python3",
    [
      join(import.meta.dirname, "mutation-lock.py"),
      resolve(root, gitLock),
      process.execPath,
      ...process.argv.slice(1),
    ],
    { env: process.env, stdio: "inherit" },
  );
  if (result.status === 75 && new Set(["reconcile", "wake"]).has(action)) {
    const goal = readJson(paths(root).active, "active-goal-missing");
    process.stdout.write(
      `${JSON.stringify({ action: "noop", reason: "mutation-contention", state: goal.state })}\n`,
    );
    process.exit(0);
  }
  if (result.status === 75) {
    process.stderr.write("mutation-contention\n");
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

function withMutationLock(_root, callback) {
  if (!mutationLockVerified) fail("mutation-lock-not-held");
  replayTransition(_root);
  return callback();
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

function fenceLease(root, goal, now, reason, recordEvent = true) {
  const controllerPaths = paths(root);
  if (!existsSync(controllerPaths.lease)) return false;
  const fenced = `${controllerPaths.lease}.stale-${randomUUID()}`;
  try {
    renameSync(controllerPaths.lease, fenced);
    fsyncParent(controllerPaths.lease);
  } catch {
    return false;
  }
  if (recordEvent) {
    appendEvent(controllerPaths.history, event(goal, now, "stale-lease-reconciled", { reason }));
  }
  rmSync(fenced, { recursive: true });
  fsyncParent(fenced);
  return true;
}

function reconcile(root, now, options = {}) {
  const locked = withMutationLock(root, () =>
    reconcileLocked(root, readJson(paths(root).active, "active-goal-missing"), now, options),
  );
  return locked;
}

function reconcileLocked(root, goal, now, options) {
  const controllerPaths = paths(root);
  const residues = readdirSync(controllerPaths.directory).filter(
    (name) => name.startsWith(".lease.stale-") || name.startsWith(".lease.released-"),
  );
  for (const residue of residues)
    rmSync(join(controllerPaths.directory, residue), { recursive: true });
  if (residues.length > 0) {
    appendEvent(
      controllerPaths.history,
      event(goal, now, "lease-residue-reconciled", { count: residues.length }),
    );
  }
  if (goal.authority?.branch && git(root, ["branch", "--show-current"]) !== goal.authority.branch) {
    const fenced = fenceLease(root, goal, now, "authority-branch-mismatch", false);
    goal.state = "blocked";
    goal.reason = "authority-branch-mismatch";
    goal.run = null;
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [
        ...(fenced
          ? [event(goal, now, "stale-lease-reconciled", { reason: "authority-branch-mismatch" })]
          : []),
        event(goal, now, "authority-branch-mismatch"),
      ],
      options,
    );
    return { action: "noop", reason: goal.reason, state: goal.state };
  }
  if (existsSync(controllerPaths.lease)) reconcileCheckpointJournal(root, goal);
  if (existsSync(controllerPaths.lease)) {
    let lease;
    try {
      lease = JSON.parse(readFileSync(join(controllerPaths.lease, "owner.json"), "utf8"));
    } catch {
      const age = now.valueOf() - statSync(controllerPaths.lease).mtimeMs;
      if (age > goal.policy.ttlMs) {
        fenceLease(root, goal, now, "incomplete-lease", false);
        if (goal.state === "running") {
          goal.state = "ready";
          goal.run = null;
        }
        commitTransition(
          root,
          [{ target: "active.json", value: goal }],
          [event(goal, now, "stale-lease-reconciled", { reason: "incomplete-lease" })],
          options,
        );
      } else return { action: "noop", reason: "lease-initializing", state: goal.state };
    }
    if (lease) {
      const expired = Date.parse(leaseExpiry(root, lease)) <= now.valueOf();
      const timedOut = goal.run?.deadlineAt && Date.parse(goal.run.deadlineAt) <= now.valueOf();
      const foreign =
        lease.worktree !== realpathSync(root) ||
        lease.branch !== goal.revision.branch ||
        lease.head !== git(root, ["rev-parse", "HEAD"]) ||
        lease.manifest !== manifest(root, goal.revision.ownedInputs) ||
        lease.revision !== goal.revision.fingerprint;
      const authorityLost =
        goal.state !== "running" ||
        lease.epoch !== goal.leaseEpoch ||
        hash(lease.ownerToken) !== goal.run?.ownerTokenHash;
      if (expired || timedOut || foreign || authorityLost) {
        const fenceReason = timedOut
          ? "time-budget-exhausted"
          : expired
            ? "ttl-expired"
            : foreign
              ? "revision-lost"
              : "run-authority-lost";
        fenceLease(root, goal, now, fenceReason, false);
        if (timedOut) {
          goal.state = "failed";
          goal.reason = "time-budget-exhausted";
          goal.run = null;
        } else if (goal.state === "running") {
          goal.state = "ready";
          goal.run = null;
        }
        commitTransition(
          root,
          [{ target: "active.json", value: goal }],
          [event(goal, now, "stale-lease-reconciled", { reason: fenceReason })],
          options,
        );
      } else {
        return { action: "noop", reason: "lease-held", state: goal.state };
      }
    }
  } else if (goal.state === "running") {
    goal.state = "ready";
    goal.reason = "lease-missing-after-restart";
    goal.run = null;
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "missing-lease-reconciled")],
      options,
    );
  }

  const conflicts = dirtyConflicts(root);
  if (conflicts.length > 0) {
    goal.state = "blocked";
    goal.reason = "dirty-tree-conflict";
    goal.question = null;
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [
        event(goal, now, "dirty-tree-conflict", {
          pathFingerprints: conflicts.map((path) => hash(path)).slice(0, 20),
        }),
      ],
      options,
    );
    return { action: "noop", reason: goal.reason, state: goal.state };
  }

  const current = revision(root, goal);
  if (goal.revision.fingerprint !== current.fingerprint) {
    const finalReviewRecorded = goal.evidence.current.some(
      (record) =>
        record.reviewerVerdict === "PASS" && retrospectiveCodes.has(record.retrospectiveCode),
    );
    if (
      goal.learning?.enforceFromRevision === goal.revision.fingerprint &&
      revisionRequiresReview(root, goal.revision.fingerprint) &&
      !goal.learning.completed.some(
        (iteration) => iteration.revision === goal.revision.fingerprint,
      ) &&
      !finalReviewRecorded
    ) {
      goal.state = "blocked";
      goal.reason = "iteration-review-required";
      goal.question = null;
      commitTransition(
        root,
        [{ target: "active.json", value: goal }],
        [event(goal, now, "iteration-review-required")],
        options,
      );
      return { action: "noop", reason: goal.reason, state: goal.state };
    }
    const invalidated = goal.evidence.current.length;
    goal.revision = current;
    if (goal.learning) goal.learning.enforceFromRevision = current.fingerprint;
    goal.evidence.current = [];
    goal.question = null;
    goal.run = null;
    goal.state = "ready";
    goal.reason = "revision-changed";
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "evidence-invalidated", { count: invalidated })],
      options,
    );
  }

  return { action: "reconciled", reason: goal.reason ?? null, state: goal.state };
}

function acquire(root, _goal, now, wakeToken) {
  const locked = withMutationLock(root, () =>
    acquireLocked(root, readJson(paths(root).active, "active-goal-missing"), now, wakeToken),
  );
  return locked;
}

function acquireLocked(root, goal, now, wakeToken) {
  const controllerPaths = paths(root);
  if (goal.lastWakeTokenHash === hash(wakeToken)) {
    return { action: "noop", reason: "duplicate-wakeup", state: goal.state };
  }
  if (goal.state === "complete") {
    return { action: "noop", reason: "goal-complete", state: goal.state };
  }
  if (goal.state === "blocked" || goal.state === "running") {
    return { action: "noop", reason: goal.reason ?? "not-admissible", state: goal.state };
  }
  if (goal.state === "waiting" && goal.waiting?.dueAt) {
    if (Date.parse(goal.waiting.dueAt) > now.valueOf()) {
      return { action: "noop", reason: "waiting-not-due", state: goal.state };
    }
    goal.waiting = null;
  }
  if (goal.state === "failed") {
    if (goal.reason === "unchanged-failure" || goal.reason === "repair-budget-exhausted") {
      return { action: "noop", reason: goal.reason, state: goal.state };
    }
    if (goal.budgets.retriesUsed >= goal.policy.maxRetries) {
      goal.reason = "retry-budget-exhausted";
      commitTransition(
        root,
        [{ target: "active.json", value: goal }],
        [event(goal, now, "retry-budget-exhausted")],
      );
      return { action: "noop", reason: goal.reason, state: goal.state };
    }
    if (goal.retryDueAt && Date.parse(goal.retryDueAt) > now.valueOf()) {
      return { action: "noop", reason: "retry-not-due", state: goal.state };
    }
    goal.budgets.retriesUsed += 1;
  }
  try {
    mkdirSync(controllerPaths.lease, { mode: 0o700 });
  } catch {
    return null;
  }
  const ownerToken = randomUUID();
  const epoch = goal.leaseEpoch + 1;
  const expiresAt = new Date(now.valueOf() + goal.policy.ttlMs).toISOString();
  const lease = {
    branch: goal.revision.branch,
    epoch,
    expiresAt,
    head: git(root, ["rev-parse", "HEAD"]),
    manifest: goal.revision.ownedManifest,
    ownerToken,
    revision: goal.revision.fingerprint,
    worktree: realpathSync(root),
  };
  try {
    atomicJson(join(controllerPaths.lease, "owner.json"), lease);
    goal.leaseEpoch = epoch;
    goal.state = "running";
    goal.reason = null;
    goal.lastWakeTokenHash = hash(wakeToken);
    goal.budgets.runsUsed += 1;
    goal.run = {
      childClaims: [],
      deadlineAt: new Date(now.valueOf() + goal.policy.maxRuntimeMs).toISOString(),
      ownerTokenHash: hash(ownerToken),
      startedAt: now.toISOString(),
    };
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "run-started", { epoch, wakeToken: hash(wakeToken) })],
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
    lease.branch !== current.branch ||
    lease.head !== git(root, ["rev-parse", "HEAD"]) ||
    lease.manifest !== current.ownedManifest ||
    lease.revision !== current.fingerprint
  ) {
    fail("lease-lost");
  }
  if (!goal.run?.deadlineAt || Date.parse(goal.run.deadlineAt) <= now.valueOf()) {
    fail("time-budget-exhausted");
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

function renew(root, _goal, options, now) {
  const locked = withMutationLock(root, () =>
    renewLocked(root, readJson(paths(root).active, "active-goal-missing"), options, now),
  );
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
  commitTransition(
    root,
    [{ target: ".lease/renewal.json", value: renewed }],
    [event(goal, now, "lease-renewed", { epoch: lease.epoch, expiresAt: renewed.expiresAt })],
    options,
  );
  return { action: "renewed", expiresAt: renewed.expiresAt, state: goal.state };
}

function initialize(root, options, now) {
  const controllerPaths = paths(root);
  mkdirSync(controllerPaths.directory, { recursive: true });
  const locked = withMutationLock(root, () => initializeLocked(root, options, now));
  return locked;
}

function initializeLocked(root, options, now) {
  const controllerPaths = paths(root);
  let previousGoal = null;
  if (existsSync(controllerPaths.active)) {
    previousGoal = readJson(controllerPaths.active, "active-goal-invalid");
    if (
      options.replaceTerminal !== "true" ||
      !new Set(["complete", "failed"]).has(previousGoal.state)
    ) {
      fail("active-goal-already-exists");
    }
    if (existsSync(controllerPaths.lease)) fail("completed-goal-lease-present");
  }
  const ownedInputs = options.ownedInput ?? [];
  if (ownedInputs.length === 0) fail("owned-input-required");
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(options.goal ?? "")) fail("invalid-goal-id");
  if (!String(options.objective ?? "").trim()) fail("objective-required");
  const objective = redact(options.objective);
  const authority = authorityFromOptions(root, options);
  const goal = {
    schemaVersion: 2,
    authority,
    goalId: options.goal,
    objectiveFingerprint: hash(objective),
    objectiveRef: existingReference(root, options.objectiveRef, "objective-ref"),
    state: "ready",
    reason: null,
    revision: { ownedInputs },
    leaseEpoch: 0,
    lastWakeTokenHash: null,
    question: null,
    run: null,
    evidence: { current: [] },
    learning: { completed: [], enforceFromRevision: null },
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
  goal.learning.enforceFromRevision = goal.revision.fingerprint;
  const events = [];
  if (previousGoal) {
    events.push({
      at: now.toISOString(),
      goalId: goal.goalId,
      previousGoalId: previousGoal.goalId,
      previousRevision: previousGoal.revision.fingerprint,
      previousState: previousGoal.state,
      revision: goal.revision.fingerprint,
      type: "terminal-goal-replaced",
    });
  }
  events.push(event(goal, now, "goal-initialized"));
  commitTransition(root, [{ target: "active.json", value: goal }], events, options);
  return { action: "initialized", state: goal.state };
}

function adoptInput(root, goal, options, now) {
  runtimeHooks.adoptPrelockPause();
  return withMutationLock(root, () => {
    goal = readJson(paths(root).active, "active-goal-missing");
    if (goal.state !== "ready" || existsSync(paths(root).lease)) fail("goal-not-ready");
    const input = safeOwnedInput(options.ownedInput);
    if (goal.revision.ownedInputs.includes(input)) {
      return { action: "noop", reason: "owned-input-already-adopted", state: goal.state };
    }
    const ownedInputs = [...goal.revision.ownedInputs, input];
    manifest(root, ownedInputs);
    goal.revision.ownedInputs = ownedInputs;
    goal.revision = revision(root, goal);
    goal.learning.enforceFromRevision = goal.revision.fingerprint;
    goal.evidence.current = [];
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "owned-input-adopted", { input: hash(input) })],
      options,
    );
    return { action: "owned-input-adopted", state: goal.state };
  });
}

function bindResearch(root, goal, options, now) {
  return withMutationLock(root, () => {
    goal = readJson(paths(root).active, "active-goal-missing");
    if (goal.state !== "ready" || existsSync(paths(root).lease)) fail("goal-not-ready");
    goal.authority.research = {
      evidenceRef: existingReference(root, options.researchRef, "research-ref"),
      reasonCode: null,
      status: "linked",
    };
    goal.authority.last30days = {
      evidenceRef: existingReference(root, options.last30daysRef, "last30days-ref"),
      reasonCode: null,
      status: "linked",
    };
    goal.revision = revision(root, goal);
    goal.learning.enforceFromRevision = goal.revision.fingerprint;
    goal.evidence.current = [];
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "research-evidence-bound")],
      options,
    );
    return { action: "research-evidence-bound", state: goal.state };
  });
}

function wake(root, goal, options, now) {
  const wakeToken = options.wakeToken;
  if (!wakeToken) fail("wake-token-required");
  const result = reconcile(root, now, options);
  goal = readJson(paths(root).active, "active-goal-missing");
  if (
    result.reason === "dirty-tree-conflict" ||
    result.reason === "lease-initializing" ||
    result.reason === "mutation-contention"
  ) {
    return result;
  }
  if (goal.lastWakeTokenHash === hash(wakeToken)) {
    return { action: "noop", reason: "duplicate-wakeup", state: goal.state };
  }
  if (goal.state === "complete")
    return { action: "noop", reason: "goal-complete", state: goal.state };
  if (goal.state === "blocked" && goal.question) {
    if (goal.question.emitted) {
      if (now.valueOf() - Date.parse(goal.question.emittedAt) > goal.policy.ttlMs) {
        const reset = withMutationLock(root, () => {
          const current = readJson(paths(root).active, "active-goal-missing");
          if (
            current.state === "blocked" &&
            current.question?.fingerprint === goal.question.fingerprint &&
            current.question.emitted &&
            now.valueOf() - Date.parse(current.question.emittedAt) > current.policy.ttlMs
          ) {
            current.question.emitted = false;
            current.question.emittedAt = null;
            commitTransition(
              root,
              [{ target: "active.json", value: current }],
              [event(current, now, "operator-question-delivery-retried")],
            );
          }
          return current;
        });
        if (!reset) return { action: "noop", reason: "mutation-contention", state: goal.state };
        rmSync(join(questionDirectory(root, goal.question.fingerprint), "emission.json"), {
          force: true,
        });
        return wake(root, reset, options, now);
      }
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
    runtimeHooks.questionPrelockPause(directory);
    const emission = withMutationLock(root, () => {
      reconcileLocked(root, readJson(paths(root).active, "active-goal-missing"), now, options);
      const current = readJson(paths(root).active, "active-goal-missing");
      if (
        current.state !== "blocked" ||
        !current.question ||
        current.question.fingerprint !== goal.question.fingerprint
      ) {
        return { action: "noop", reason: "question-invalidated", state: current.state };
      }
      if (current.question.emitted) {
        return {
          action: "noop",
          reason: "blocked-question-already-emitted",
          state: current.state,
        };
      }
      current.question.emitted = true;
      current.question.emittedAt = now.toISOString();
      commitTransition(
        root,
        [{ target: "active.json", value: current }],
        [event(current, now, "operator-question-delivered")],
      );
      return { action: "ask", question: runtimeQuestion.text, state: current.state };
    });
    if (emission.reason === "question-invalidated") rmSync(claim, { force: true });
    return emission;
  }
  if (result.reason === "lease-held") return result;
  return acquire(root, goal, now, wakeToken);
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
    record.revision !== goal.revision.fingerprint ||
    record.head !== git(root, ["rev-parse", "HEAD"])
  ) {
    fail("evidence-record-mismatch");
  }
  const completedAt = Date.parse(record.completedAt);
  const evidenceStartedAt = Date.parse(goal.run?.startedAt ?? goal.question?.createdAt ?? 0);
  if (
    !Number.isFinite(completedAt) ||
    completedAt < evidenceStartedAt ||
    completedAt > now.valueOf()
  ) {
    fail("stale-evidence-record");
  }
  return { contentHash: hash(content), record };
}

function loadAgentEvidenceRecord(root, recordPath, expected, goal, now) {
  const evidence = loadEvidenceRecord(root, recordPath, expected, goal, now);
  const { record } = evidence;
  if (record.source !== "collaboration-agent-output" || !record.agentId || record.fresh !== true) {
    fail("independent-verdicts-required");
  }
  const taskRef = safeReference(record.taskRef, "agent-task-ref");
  const childClaim = goal.run?.childClaims?.find(
    (claim) => claim.tokenHash === hash(String(record.childClaim ?? "")),
  );
  if (
    childClaim?.status !== "completed" ||
    childClaim.role !== expected.kind ||
    childClaim.taskRefHash !== hash(taskRef) ||
    childClaim.revision !== goal.revision.fingerprint ||
    childClaim.epoch !== goal.leaseEpoch
  ) {
    fail("independent-child-claim-required");
  }
  const reportPath = resolve(root, String(record.reportPath ?? ""));
  if (!reportPath.startsWith(`${root}/`)) fail("agent-report-outside-root");
  let report;
  try {
    if (!lstatSync(reportPath).isFile()) fail("invalid-agent-report");
    report = readFileSync(reportPath, "utf8");
  } catch {
    fail("invalid-agent-report");
  }
  if (
    record.reportHash !== hash(report) ||
    report.trimStart().split(/\r?\n/, 1)[0] !== expected.value
  ) {
    fail("agent-report-mismatch");
  }
  return evidence;
}

function recordIteration(root, options, now) {
  const locked = withMutationLock(root, () => {
    const goal = readJson(paths(root).active, "active-goal-missing");
    assertLease(root, goal, options.ownerToken, now);
    if (!retrospectiveCodes.has(options.retrospectiveCode)) fail("invalid-retrospective-code");
    if (!new Set(["PASS", "FAIL"]).has(options.reviewVerdict)) fail("invalid-review-verdict");
    const retrospective = loadEvidenceRecord(
      root,
      options.retrospectiveRecord,
      { field: "outcome", kind: "retrospective", value: options.retrospectiveCode },
      goal,
      now,
    );
    existingReference(root, retrospective.record.evidenceRef, "retrospective-record");
    if (options.retrospectiveCode === "no-new-lesson") {
      safeReference(retrospective.record.reasonCode, "retrospective-record");
    }
    const reviewer = loadAgentEvidenceRecord(
      root,
      options.reviewerRecord,
      { field: "verdict", kind: "standards-review", value: options.reviewVerdict },
      goal,
      now,
    );
    if (
      goal.learning.completed.some((iteration) => iteration.revision === goal.revision.fingerprint)
    ) {
      return { action: "noop", reason: "iteration-already-recorded", state: goal.state };
    }
    const iteration = {
      at: now.toISOString(),
      retrospectiveCode: options.retrospectiveCode,
      retrospectiveRecordHash: retrospective.contentHash,
      reviewerAgent: hash(reviewer.record.agentId),
      reviewerRecordHash: reviewer.contentHash,
      reviewerVerdict: options.reviewVerdict,
      revision: goal.revision.fingerprint,
    };
    goal.learning.completed.push(iteration);
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [event(goal, now, "iteration-recorded", iteration)],
      options,
    );
    return { action: "iteration-recorded", state: goal.state };
  });
  return locked;
}

function claimChild(root, options, now) {
  return withMutationLock(root, () => {
    const goal = readJson(paths(root).active, "active-goal-missing");
    const lease = assertLease(root, goal, options.ownerToken, now);
    const taskRef = safeReference(options.taskRef, "child-task-ref");
    if (!directChildRoles.has(options.role)) fail("invalid-child-role");
    goal.run.childClaims ??= [];
    const taskRefHash = hash(taskRef);
    if (goal.run.childClaims.some((claim) => claim.taskRefHash === taskRefHash)) {
      fail("duplicate-child-claim");
    }
    const activeClaims = goal.run.childClaims.filter((claim) => claim.status === "active");
    if (activeClaims.length >= goal.policy.maxDirectChildren) {
      fail("direct-child-budget-exhausted");
    }
    const childClaim = randomUUID();
    const claim = {
      epoch: lease.epoch,
      head: lease.head,
      manifest: lease.manifest,
      revision: lease.revision,
      role: options.role,
      status: "active",
      taskRefHash,
      tokenHash: hash(childClaim),
    };
    goal.run.childClaims.push(claim);
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [
        event(goal, now, "child-claimed", {
          epoch: lease.epoch,
          role: options.role,
          taskRefHash,
        }),
      ],
      options,
    );
    return {
      action: "child-claimed",
      childClaim,
      leaseExpiresAt: leaseExpiry(root, lease),
      state: goal.state,
    };
  });
}

function settleChild(root, options, now) {
  return withMutationLock(root, () => {
    const goal = readJson(paths(root).active, "active-goal-missing");
    const lease = assertLease(root, goal, options.ownerToken, now);
    if (!new Set(["completed", "cancelled"]).has(options.outcome)) {
      fail("invalid-child-outcome");
    }
    const claim = goal.run.childClaims?.find(
      (candidate) => candidate.tokenHash === hash(String(options.childClaim ?? "")),
    );
    if (
      claim?.status !== "active" ||
      claim.epoch !== lease.epoch ||
      claim.revision !== lease.revision ||
      claim.head !== lease.head ||
      claim.manifest !== lease.manifest
    ) {
      fail("invalid-child-claim");
    }
    claim.status = options.outcome;
    claim.settledAt = now.toISOString();
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [
        event(goal, now, "child-settled", {
          outcome: options.outcome,
          taskRefHash: claim.taskRefHash,
        }),
      ],
      options,
    );
    return { action: "child-settled", outcome: options.outcome, state: goal.state };
  });
}

function resolveQuestion(root, options, now) {
  const locked = withMutationLock(root, () => {
    const goal = readJson(paths(root).active, "active-goal-missing");
    if (
      goal.state !== "blocked" ||
      !goal.question ||
      goal.question.fingerprint !== options.questionFingerprint
    ) {
      fail("question-resolution-mismatch");
    }
    const fingerprint = goal.question.fingerprint;
    const resolution = loadEvidenceRecord(
      root,
      options.resolutionRecord,
      { field: "status", kind: "operator-resolution", value: "ACCEPT" },
      goal,
      now,
    );
    if (resolution.record.questionFingerprint !== fingerprint) {
      fail("question-resolution-mismatch");
    }
    existingReference(root, resolution.record.authorityRef, "operator-authority-ref");
    goal.question = null;
    goal.reason = "operator-input-received";
    goal.state = "ready";
    commitTransition(
      root,
      [{ target: "active.json", value: goal }],
      [
        event(goal, now, "operator-question-resolved", {
          fingerprint,
          resolutionRecordHash: resolution.contentHash,
        }),
      ],
      options,
    );
    rmSync(questionDirectory(root, fingerprint), { recursive: true, force: true });
    return { action: "question-resolved", state: goal.state };
  });
  return locked;
}

function checkpoint(root, _goal, options, now) {
  const locked = withMutationLock(root, () =>
    checkpointLocked(root, readJson(paths(root).active, "active-goal-missing"), options, now),
  );
  return locked;
}

function checkpointLocked(root, goal, options, now) {
  if (!states.has(options.state) || options.state === "ready" || options.state === "running") {
    fail("invalid-checkpoint-state");
  }
  const lease = assertLease(root, goal, options.ownerToken, now);
  testPause(options);
  if (options.directChildren !== undefined) fail("caller-child-count-forbidden");
  if (goal.run.childClaims?.some((claim) => claim.status === "active")) {
    fail("active-child-claims");
  }
  let reason = null;
  const details = { state: options.state };
  const extraEvents = [];

  if (options.state === "complete") {
    if (!retrospectiveCodes.has(options.retrospectiveCode)) fail("invalid-retrospective-code");
    const retrospective = loadEvidenceRecord(
      root,
      options.retrospectiveRecord,
      { field: "outcome", kind: "retrospective", value: options.retrospectiveCode },
      goal,
      now,
    );
    try {
      existingReference(root, retrospective.record.evidenceRef, "retrospective-record");
      if (options.retrospectiveCode === "no-new-lesson") {
        safeReference(retrospective.record.reasonCode, "retrospective-record");
      }
    } catch {
      fail("invalid-retrospective-record");
    }
    const reviewer = loadAgentEvidenceRecord(
      root,
      options.reviewerRecord,
      { field: "verdict", kind: "standards-review", value: "PASS" },
      goal,
      now,
    );
    const verifier = loadAgentEvidenceRecord(
      root,
      options.verifierRecord,
      { field: "verdict", kind: "verifier", value: "ACCEPT" },
      goal,
      now,
    );
    const validator = loadAgentEvidenceRecord(
      root,
      options.validatorRecord,
      { field: "verdict", kind: "validator", value: "PASS" },
      goal,
      now,
    );
    if (
      !reviewer.record.agentId ||
      !verifier.record.agentId ||
      !validator.record.agentId ||
      new Set([reviewer.record.agentId, verifier.record.agentId, validator.record.agentId]).size !==
        3 ||
      reviewer.record.fresh !== true ||
      verifier.record.fresh !== true ||
      validator.record.fresh !== true
    ) {
      fail("independent-verdicts-required");
    }
    if (
      new Set([reviewer.record.childClaim, verifier.record.childClaim, validator.record.childClaim])
        .size !== 3 ||
      new Set([reviewer.record.taskRef, verifier.record.taskRef, validator.record.taskRef]).size !==
        3
    ) {
      fail("distinct-child-claims-required");
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
    const completion = loadEvidenceRecord(
      root,
      options.completionRecord,
      { field: "status", kind: "goal-completion", value: "PASS" },
      goal,
      now,
    );
    const expectedExternalState =
      goal.authority.externalCompletion === "required" ? "complete" : "not-required";
    existingReference(root, completion.record.zeroDebtEvidenceRef, "zero-debt-ref");
    if (
      completion.record.branch !== goal.authority.branch ||
      completion.record.externalState !== expectedExternalState ||
      completion.record.logicalCommit !== completion.record.head ||
      completion.record.researchEvidenceRef !== goal.authority.research.evidenceRef ||
      completion.record.last30daysEvidenceRef !== goal.authority.last30days.evidenceRef ||
      completion.record.zeroDebt !== true
    ) {
      fail("completion-contract-mismatch");
    }
    if (goal.authority.externalCompletion === "required") {
      existingReference(root, completion.record.externalEvidenceRef, "external-evidence-ref");
    }
    const evidence = {
      aggregateRecordHash: aggregate.contentHash,
      at: now.toISOString(),
      completionRecordHash: completion.contentHash,
      protectedArtifactRecordHash: protectedArtifacts.contentHash,
      retrospectiveCode: options.retrospectiveCode,
      retrospectiveRecordHash: retrospective.contentHash,
      revision: goal.revision.fingerprint,
      reviewerAgent: hash(reviewer.record.agentId),
      reviewerRecordHash: reviewer.contentHash,
      reviewerVerdict: "PASS",
      validatorAgent: hash(validator.record.agentId),
      validatorRecordHash: validator.contentHash,
      validatorVerdict: "PASS",
      verifierAgent: hash(verifier.record.agentId),
      verifierRecordHash: verifier.contentHash,
      verifierVerdict: "ACCEPT",
    };
    goal.evidence.current.push(evidence);
    if (
      !goal.learning.completed.some((iteration) => iteration.revision === goal.revision.fingerprint)
    ) {
      goal.learning.completed.push({
        at: now.toISOString(),
        retrospectiveCode: options.retrospectiveCode,
        retrospectiveRecordHash: retrospective.contentHash,
        reviewerAgent: hash(reviewer.record.agentId),
        reviewerRecordHash: reviewer.contentHash,
        reviewerVerdict: "PASS",
        revision: goal.revision.fingerprint,
      });
    }
    details.retrospectiveCode = options.retrospectiveCode;
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
      goal.question = {
        createdAt: now.toISOString(),
        emitted: false,
        emittedAt: null,
        fingerprint,
      };
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
    if (options.repair !== undefined) fail("caller-repair-count-forbidden");
    const fingerprint = hash(redact(options.failureFingerprint));
    if (goal.failureFingerprint === fingerprint) {
      reason = "unchanged-failure";
      goal.retryDueAt = null;
    } else {
      if (goal.budgets.repairCyclesUsed + 1 > goal.policy.maxRepairCycles) {
        reason = "repair-budget-exhausted";
        goal.retryDueAt = null;
      } else {
        goal.budgets.repairCyclesUsed += 1;
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

export function runController(hooks = productionRuntime) {
  runtimeHooks = hooks;
  try {
    const { action, options } = parseArguments(process.argv.slice(2));
    if (
      hooks === productionRuntime &&
      Object.keys(options).some((name) => name.startsWith("test"))
    ) {
      fail("test-control-forbidden");
    }
    const root = realpathSync(resolve(options.root ?? "."));
    delegateUnderMutationLock(root, action, options);
    const now = nowFrom(options);

    let result;
    if (action === "init") {
      result = initialize(root, options, now);
    } else {
      const goal = readJson(paths(root).active, "active-goal-missing");
      if (action === "reconcile") result = reconcile(root, now, options);
      else if (action === "wake") result = wake(root, goal, options, now);
      else if (action === "renew") result = renew(root, goal, options, now);
      else if (action === "checkpoint") result = checkpoint(root, goal, options, now);
      else if (action === "adopt-input") result = adoptInput(root, goal, options, now);
      else if (action === "bind-research") result = bindResearch(root, goal, options, now);
      else if (action === "claim-child") result = claimChild(root, options, now);
      else if (action === "settle-child") result = settleChild(root, options, now);
      else if (action === "record-iteration") result = recordIteration(root, options, now);
      else if (action === "resolve-question") result = resolveQuestion(root, options, now);
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
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runController();
}
