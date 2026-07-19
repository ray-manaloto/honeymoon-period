#!/usr/bin/env python3
"""Hold a non-blocking OS file lock for one controller mutation session."""

from __future__ import annotations

import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time


def write_json(path: Path, value: dict[str, str]) -> None:
    temporary = path.with_name(f"{path.name}.tmp-{os.getpid()}")
    with temporary.open("x", encoding="utf-8") as stream:
        json.dump(value, stream, separators=(",", ":"))
        stream.write("\n")
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)
    descriptor = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def process_identity(pid: int) -> str | None:
    result = subprocess.run(
        ["ps", "-o", "lstart=", "-p", str(pid)],
        check=False,
        capture_output=True,
        text=True,
    )
    started = result.stdout.strip()
    if not started:
        return None
    return hashlib.sha256(f"{pid}\0{started}".encode()).hexdigest()


def main() -> int:
    lock_path = Path(sys.argv[1])
    session = Path(sys.argv[2])
    parent_pid = int(sys.argv[3])
    parent_identity = sys.argv[4]
    session.mkdir(mode=0o700, parents=True, exist_ok=False)
    lock_path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    parent_dead = False
    with lock_path.open("a+", encoding="utf-8") as lock:
        try:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            write_json(
                session / "result.json",
                {
                    "parentIdentity": parent_identity,
                    "parentPid": str(parent_pid),
                    "status": "contention",
                },
            )
            return 0
        write_json(
            session / "result.json",
            {
                "parentIdentity": parent_identity,
                "parentPid": str(parent_pid),
                "status": "acquired",
            },
        )
        try:
            while not (session / "stop").exists():
                if process_identity(parent_pid) != parent_identity:
                    parent_dead = True
                    break
                time.sleep(0.025)
        finally:
            fcntl.flock(lock.fileno(), fcntl.LOCK_UN)
            if not parent_dead:
                write_json(session / "released.json", {"status": "released"})
    if parent_dead:
        for path in session.iterdir():
            path.unlink(missing_ok=True)
        session.rmdir()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
