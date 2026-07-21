#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { runController } from "../../scripts/symphony-controller.mjs";

function pause(milliseconds) {
  const duration = Number(milliseconds ?? 0);
  if (!Number.isInteger(duration) || duration < 0 || duration > 5_000) {
    throw new Error("invalid test pause");
  }
  if (duration > 0) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration);
  }
}

runController({
  adoptPrelockPause() {
    pause(process.env.SYMPHONY_TEST_ADOPT_PRELOCK_PAUSE_MS);
  },
  crash(options, phase) {
    if (options.testCrashAfter === phase) process.exit(86);
  },
  now(options) {
    return options.now ?? Date.now();
  },
  pause(options) {
    pause(options.testPauseMs);
  },
  questionPrelockPause(directory) {
    const duration = Number(process.env.SYMPHONY_TEST_QUESTION_PRELOCK_PAUSE_MS ?? 0);
    if (duration > 0) writeFileSync(join(directory, "test-prelock-paused"), "paused\n");
    pause(duration);
  },
});
