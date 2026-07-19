#!/usr/bin/env python3
"""Acquire the controller mutex, then replace this process with the mutator."""

from __future__ import annotations

import fcntl
import os
from pathlib import Path
import sys
import time


def verify(lock_path: Path) -> int:
    """Prove fd 3 is the same open description that owns the path's flock."""
    claimed_fd = 3
    try:
        claimed = os.fstat(claimed_fd)
        target = lock_path.stat()
    except OSError:
        return 65
    if (claimed.st_dev, claimed.st_ino) != (target.st_dev, target.st_ino):
        return 65

    probe = lock_path.open("a+", encoding="utf-8")
    try:
        try:
            fcntl.flock(probe.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            pass
        else:
            return 65
        try:
            fcntl.flock(claimed_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return 65
        return 0
    finally:
        probe.close()


def acquire(lock_path: Path, command: list[str]) -> int:
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
    command.extend(["--mutation-lock-fd", str(lock.fileno())])
    os.execvpe(command[0], command, os.environ)
    return 70


def main() -> int:
    if len(sys.argv) >= 3 and sys.argv[1] == "--verify":
        return verify(Path(sys.argv[2]))
    if len(sys.argv) < 2:
        return 64
    return acquire(Path(sys.argv[1]), sys.argv[2:])


if __name__ == "__main__":
    raise SystemExit(main())
