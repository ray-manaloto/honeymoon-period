import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");

function run(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8" });
}

const orchestrationPolicyPaths = [
  ".agents/skills/adaptive-orchestration/SKILL.md",
  ".codex/config.toml",
  ".codex/goals/CONTINUATION.md",
  ".codex/hooks.json",
  "AGENTS.md",
  "docs/agents/adaptive-orchestration.md",
  "docs/agents/handoff-template.md",
  "docs/agents/issue-tracker.md",
  "docs/learning/README.md",
  "docs/learning/TEMPLATE.md",
  "docs/research/codex-context-lifecycle.md",
  "scripts/symphony-controller.mjs",
  "scripts/mutation-lock.py",
];

function createOrchestrationFixture() {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-orchestration-"));
  for (const path of orchestrationPolicyPaths) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(root, path), destination);
  }
  return directory;
}

const protectedShortcutPaths = [
  "shortcut/Save honeymoon-period.cherri",
  "shortcut/Save Date Idea API.cherri",
  "dist/Save honeymoon-period.shortcut",
  "dist/Save Date Idea API.shortcut",
];

function protectedShortcutState() {
  return {
    hashes: protectedShortcutPaths.map((path) =>
      createHash("sha256")
        .update(readFileSync(join(root, path)))
        .digest("hex"),
    ),
    status: run("git", ["status", "--porcelain=v1"]),
  };
}

function createPassingShortcutHarness(prefix) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  const compiler = join(directory, "cherri");
  const toolDir = join(directory, "tools");
  mkdirSync(toolDir);
  const outputArgument = "$" + "{arg#--output=}";
  const plistPath = "$" + "{output:r}.plist";
  writeFileSync(
    compiler,
    `#!/bin/zsh\nfor arg in "$@"; do\n  if [[ "$arg" == --output=* ]]; then\n    output=${outputArgument}\n    print "fixture" > "${plistPath}"\n  fi\ndone\n`,
  );
  chmodSync(compiler, 0o755);
  for (const name of [
    "fix-import-questions.py",
    "verify-shortcut.py",
    "fix-save-date-idea-import-questions.py",
    "verify-save-date-idea-shortcut.py",
  ]) {
    const script = join(toolDir, name);
    writeFileSync(script, "#!/usr/bin/env python3\n");
    chmodSync(script, 0o755);
  }
  return { compiler, directory, toolDir };
}

function runReadOnlyShortcutVerification(harness, artifactDir) {
  return spawnSync("zsh", ["scripts/verify-shortcuts-readonly.sh"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      HONEYMOON_CHERRI_BIN: harness.compiler,
      HONEYMOON_SHORTCUT_ARTIFACT_DIR: artifactDir,
      HONEYMOON_SHORTCUT_TOOL_DIR: harness.toolDir,
    },
  });
}

function createBundleFixture({ entry = Buffer.from("console.log('entry')"), lazy } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-bundle-"));
  const assets = join(directory, "assets");
  mkdirSync(assets);
  writeFileSync(
    join(directory, "index.html"),
    '<script type="module" src="/assets/entry.js"></script>',
  );
  writeFileSync(join(assets, "entry.js"), entry);
  if (lazy) writeFileSync(join(assets, "lazy.js"), lazy);
  return directory;
}

function deterministicBytes(length) {
  const chunks = [];
  let bytes = 0;
  for (let index = 0; bytes < length; index += 1) {
    const chunk = createHash("sha256").update(`bundle-budget-${index}`).digest();
    chunks.push(chunk);
    bytes += chunk.length;
  }
  return Buffer.concat(chunks).subarray(0, length);
}

test("OpenAPI response audit accepts the canonical contract", () => {
  assert.match(
    run("node", ["scripts/check-openapi-responses.mjs"]),
    /OpenAPI error response audit passed for \d+ operations/,
  );
});

test("adaptive orchestration policy accepts the canonical repository", () => {
  assert.match(
    run("node", ["scripts/check-adaptive-orchestration.mjs"]),
    /Adaptive orchestration policy passed/,
  );
});

test("adaptive orchestration policy rejects unsafe agent fan-out", () => {
  const directory = createOrchestrationFixture();
  const configPath = join(directory, ".codex/config.toml");
  writeFileSync(
    configPath,
    readFileSync(configPath, "utf8").replace("max_depth = 1", "max_depth = 2"),
  );
  const result = spawnSync("node", ["scripts/check-adaptive-orchestration.mjs", directory], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /max_depth must remain 1/);
});

test("adaptive orchestration policy rejects the unstable fan-out feature", () => {
  const directory = createOrchestrationFixture();
  const configPath = join(directory, ".codex/config.toml");
  writeFileSync(
    configPath,
    readFileSync(configPath, "utf8").replace(
      "unified_exec = true",
      "unified_exec = true\nenable_fanout = true",
    ),
  );
  const result = spawnSync("node", ["scripts/check-adaptive-orchestration.mjs", directory], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /enable_fanout must remain unset/);
});

test("adaptive orchestration policy rejects a broken self-learning autonomy loop", () => {
  const cases = [
    {
      path: "docs/agents/adaptive-orchestration.md",
      from: "## Autonomous learning loop",
      message: /orchestration policy is missing Autonomous learning loop/,
    },
    {
      path: "AGENTS.md",
      from: "Only request a human interview",
      message: /AGENTS.md must reserve human interviews for unresolved ambiguity/,
    },
    {
      path: "docs/agents/issue-tracker.md",
      from: "## Autonomous merge gate",
      message: /issue tracker must define the autonomous merge gate/,
    },
    {
      path: "docs/agents/issue-tracker.md",
      from: "--match-head-commit",
      message: /autonomous merge must atomically match the reviewed head/,
    },
    {
      path: ".codex/goals/CONTINUATION.md",
      from: "autonomous learning loop",
      message: /continuation must route admitted runs through the autonomous learning loop/,
    },
    {
      path: "docs/learning/README.md",
      from: "Every material goal iteration",
      message: /learning registry must cover every material goal iteration/,
    },
  ];
  for (const fixture of cases) {
    const directory = createOrchestrationFixture();
    const path = join(directory, fixture.path);
    writeFileSync(path, readFileSync(path, "utf8").replace(fixture.from, "REMOVED"));
    const result = spawnSync("node", ["scripts/check-adaptive-orchestration.mjs", directory], {
      cwd: root,
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, fixture.path);
    assert.match(result.stderr, fixture.message);
  }
});

test("OpenAPI response audit rejects an operation with an undocumented emitted error", () => {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-openapi-"));
  const contract = JSON.parse(readFileSync(join(root, "openapi/v1.json"), "utf8"));
  delete contract.paths["/captures"].post.responses[500];
  const path = join(directory, "invalid.json");
  writeFileSync(path, JSON.stringify(contract));
  const result = spawnSync("node", ["scripts/check-openapi-responses.mjs", path], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /POST \/captures is missing 500/);
});

test("OpenAPI response audit requires not-found responses for addressed resources", () => {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-openapi-"));
  const contract = JSON.parse(readFileSync(join(root, "openapi/v1.json"), "utf8"));
  delete contract.paths["/honeymoon-periods/{id}"].get.responses[404];
  const path = join(directory, "invalid.json");
  writeFileSync(path, JSON.stringify(contract));
  const result = spawnSync("node", ["scripts/check-openapi-responses.mjs", path], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /GET \/honeymoon-periods\/\{id\} is missing 404/);
});

test("OpenAPI response audit rejects a missing operation ID", () => {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-openapi-"));
  const contract = JSON.parse(readFileSync(join(root, "openapi/v1.json"), "utf8"));
  delete contract.paths["/captures"].post.operationId;
  const path = join(directory, "missing-operation-id.json");
  writeFileSync(path, JSON.stringify(contract));
  const result = spawnSync("node", ["scripts/check-openapi-responses.mjs", path], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /POST \/captures has no operationId/);
});

test("OpenAPI response audit identifies both operations with a duplicate operation ID", () => {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-openapi-"));
  const contract = JSON.parse(readFileSync(join(root, "openapi/v1.json"), "utf8"));
  contract.paths["/honeymoon-periods"].get.operationId = "createCapture";
  const path = join(directory, "duplicate-operation-id.json");
  writeFileSync(path, JSON.stringify(contract));
  const result = spawnSync("node", ["scripts/check-openapi-responses.mjs", path], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /POST \/captures and GET \/honeymoon-periods have duplicate operationId createCapture/,
  );
});

test("web bundle budget accepts chunks and initial JavaScript within both limits", () => {
  const fixture = createBundleFixture({ lazy: Buffer.alloc(499_999, "x") });
  const result = spawnSync("node", ["scripts/check-web-bundle-budget.mjs", fixture], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Web bundle budget passed/);
});

test("web bundle budget rejects an oversized lazy JavaScript chunk", () => {
  const fixture = createBundleFixture({ lazy: Buffer.alloc(500_001, "x") });
  const result = spawnSync("node", ["scripts/check-web-bundle-budget.mjs", fixture], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lazy\.js is 500001 bytes; limit is 500000/);
});

test("web bundle budget rejects initial-load gzip regression independently of chunk size", () => {
  const fixture = createBundleFixture({ entry: deterministicBytes(270_000) });
  const result = spawnSync("node", ["scripts/check-web-bundle-budget.mjs", fixture], {
    cwd: root,
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /initial JavaScript is \d+ gzip bytes; limit is 260590/);
});

test("worktree manifest inventories requested files without modifying them", () => {
  const before = run("git", ["status", "--short"]);
  const manifest = JSON.parse(run("node", ["scripts/worktree-manifest.mjs", "package.json"]));
  assert.equal(manifest.entries.length, 1);
  assert.equal(manifest.entries[0].path, "package.json");
  assert.match(manifest.entries[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(run("git", ["status", "--short"]), before);
});

test("worktree manifest expands requested directories deterministically", () => {
  const manifest = JSON.parse(nodeManifest("docs/learning"));
  assert.deepEqual(
    manifest.entries.map((entry) => entry.path),
    [...manifest.entries.map((entry) => entry.path)].sort(),
  );
  assert.ok(manifest.entries.some((entry) => entry.path === "docs/learning/README.md"));
});

function nodeManifest(path) {
  return run("node", ["scripts/worktree-manifest.mjs", path]);
}

test("semantic search excludes generated validator bodies by default", () => {
  const output = run("zsh", ["scripts/semantic-search.sh", "contractValidators", "."]);
  assert.doesNotMatch(output, /packages\/generated\/src\/validators\.ts/);
});

test("read-only Shortcut verification propagates compiler failures", () => {
  const directory = mkdtempSync(join(tmpdir(), "honeymoon-cherri-"));
  const failingCompiler = join(directory, "cherri");
  writeFileSync(failingCompiler, "#!/bin/zsh\nexit 23\n");
  chmodSync(failingCompiler, 0o755);
  const result = spawnSync("zsh", ["scripts/verify-shortcuts-readonly.sh"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, HONEYMOON_CHERRI_BIN: failingCompiler },
  });
  assert.equal(result.status, 23);
});

test("successful read-only Shortcut verification leaves deliverables and Git state unchanged", () => {
  const harness = createPassingShortcutHarness("honeymoon-cherri-success-");
  const before = protectedShortcutState();
  const result = runReadOnlyShortcutVerification(harness, join(root, "dist"));
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(protectedShortcutState(), before);
});

test("read-only Shortcut verification rejects structural and authenticated corruption without repository mutation", () => {
  const harness = createPassingShortcutHarness("honeymoon-shortcut-corrupt-");
  const artifactName = "Save honeymoon-period.shortcut";
  const genuine = readFileSync(join(root, "dist", artifactName));
  const authDataLength = genuine.readUInt32LE(8);
  const signatureOffset = 12 + authDataLength;
  const corruptions = [
    ["empty artifact", () => Buffer.alloc(0)],
    ["one-byte truncation", () => genuine.subarray(0, genuine.length - 1)],
    ["invalid AEA magic", () => Buffer.concat([Buffer.from("NOPE"), genuine.subarray(4)])],
    [
      "malformed authentication-data envelope",
      () => {
        const corrupted = Buffer.from(genuine);
        corrupted.writeUInt32LE(0, 8);
        return corrupted;
      },
    ],
    [
      "authentication-data corruption",
      () => {
        const corrupted = Buffer.from(genuine);
        corrupted[100] ^= 1;
        return corrupted;
      },
    ],
    [
      "signature corruption",
      () => {
        const corrupted = Buffer.from(genuine);
        corrupted[signatureOffset + 4] ^= 1;
        return corrupted;
      },
    ],
    [
      "payload corruption",
      () => {
        const corrupted = Buffer.from(genuine);
        corrupted[Math.floor(corrupted.length / 2)] ^= 1;
        return corrupted;
      },
    ],
  ];
  const before = protectedShortcutState();

  for (const [name, corrupt] of corruptions) {
    const artifactDir = join(harness.directory, name.replaceAll(" ", "-"));
    mkdirSync(artifactDir);
    for (const candidateName of [artifactName, "Save Date Idea API.shortcut"]) {
      writeFileSync(
        join(artifactDir, candidateName),
        readFileSync(join(root, "dist", candidateName)),
      );
    }
    writeFileSync(join(artifactDir, artifactName), corrupt());

    const result = runReadOnlyShortcutVerification(harness, artifactDir);
    assert.notEqual(result.status, 0, `${name} unexpectedly passed`);
    assert.match(result.stderr, /Signed Shortcut verification failed/, name);
    assert.deepEqual(
      protectedShortcutState(),
      before,
      `${name} mutated protected repository state`,
    );
  }
});
