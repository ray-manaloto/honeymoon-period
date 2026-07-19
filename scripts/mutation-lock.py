#!/usr/bin/env python3
"""Acquire the controller mutex, then replace this process with the mutator."""

from __future__ import annotations

import fcntl
import os
from pathlib import Path
import sys
import time


def main() -> int:
    lock_path = Path(sys.argv[1])
    command = sys.argv[2:]
    if not command:
        return 64
    lock_path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    lock = lock_path.open("a+", encoding="utf-8")
    deadline = time.monotonic() + 1.0
    while True:
        try:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            break
        except BlockingIOError:
            if time.monotonic() >= deadline:
                return 75
            time.sleep(0.01)
    os.set_inheritable(lock.fileno(), True)
    environment = {**os.environ, "SYMPHONY_MUTATION_LOCK_HELD": "1"}
    os.execvpe(command[0], command, environment)
    return 70


if __name__ == "__main__":
    raise SystemExit(main())
