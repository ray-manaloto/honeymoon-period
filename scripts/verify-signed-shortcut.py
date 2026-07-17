#!/usr/bin/env python3
"""Verify a signed Shortcut's AEA envelope without importing or running it."""

from __future__ import annotations

import json
import plistlib
import struct
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import NoReturn


AEA_MAGIC = b"AEA1"
APPLE_ARCHIVE_MAGIC = b"AA01"
AUTH_DATA_LENGTH_OFFSET = 8
AUTH_DATA_OFFSET = 12


def fail(path: Path, message: str) -> NoReturn:
    print(f"Signed Shortcut verification failed for {path}: {message}", file=sys.stderr)
    raise SystemExit(1)


def command_error(result: subprocess.CompletedProcess[bytes]) -> str:
    detail = result.stderr.decode("utf-8", errors="replace").strip()
    return " ".join(detail.split()) or f"command exited {result.returncode}"


def run_checked(path: Path, command: list[str], description: str) -> bytes:
    try:
        result = subprocess.run(command, capture_output=True, check=False)
    except OSError as error:
        fail(path, f"could not run {description}: {error}")
    if result.returncode != 0:
        fail(path, f"{description} failed: {command_error(result)}")
    return result.stdout


def parse_certificate_chain(path: Path, data: bytes) -> list[bytes]:
    if len(data) < AUTH_DATA_OFFSET:
        fail(path, "truncated AEA1 header")
    if data[: len(AEA_MAGIC)] != AEA_MAGIC:
        fail(path, "invalid AEA1 magic")

    auth_data_length = struct.unpack_from("<I", data, AUTH_DATA_LENGTH_OFFSET)[0]
    auth_data_end = AUTH_DATA_OFFSET + auth_data_length
    if auth_data_length == 0 or auth_data_end >= len(data):
        fail(path, "truncated or empty AEA authentication-data envelope")

    try:
        auth_data = plistlib.loads(data[AUTH_DATA_OFFSET:auth_data_end])
    except (plistlib.InvalidFileException, ValueError, TypeError, OverflowError) as error:
        fail(path, f"malformed AEA authentication-data plist: {error}")
    if not isinstance(auth_data, dict):
        fail(path, "AEA authentication data is not a dictionary")

    chain = auth_data.get("SigningCertificateChain")
    if not isinstance(chain, list) or not chain:
        fail(path, "missing or empty SigningCertificateChain")
    if not all(isinstance(certificate, bytes) and certificate for certificate in chain):
        fail(path, "SigningCertificateChain contains a malformed certificate")
    return chain


def verify(path: Path) -> int:
    if not path.is_file():
        fail(path, "artifact is missing")

    data = path.read_bytes()
    certificate_chain = parse_certificate_chain(path, data)

    with tempfile.TemporaryDirectory(prefix="honeymoon-signed-shortcut-") as scratch_name:
        scratch = Path(scratch_name)
        leaf_path = scratch / "leaf.der"
        public_key_path = scratch / "leaf-public.pem"
        payload_path = scratch / "payload.aar"
        leaf_path.write_bytes(certificate_chain[0])

        public_key = run_checked(
            path,
            [
                "/usr/bin/openssl",
                "x509",
                "-inform",
                "DER",
                "-in",
                str(leaf_path),
                "-pubkey",
                "-noout",
            ],
            "embedded leaf-certificate parsing",
        )
        if not public_key.startswith(b"-----BEGIN PUBLIC KEY-----"):
            fail(path, "embedded leaf certificate did not yield a public key")
        public_key_path.write_bytes(public_key)

        run_checked(
            path,
            [
                "/usr/bin/aea",
                "decrypt",
                "-i",
                str(path),
                "-o",
                str(payload_path),
                "-sign-pub",
                str(public_key_path),
            ],
            "AEA signature and payload authentication",
        )

        payload = payload_path.read_bytes()
        if not payload.startswith(APPLE_ARCHIVE_MAGIC):
            fail(path, "authenticated payload is not an AA01 Apple Archive")

        listing = run_checked(
            path,
            [
                "/usr/bin/aa",
                "list",
                "-i",
                str(payload_path),
                "-list-format",
                "json",
            ],
            "authenticated Apple Archive parsing",
        )
        try:
            entries = json.loads(listing)
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            fail(path, f"authenticated Apple Archive listing is malformed: {error}")
        files = [entry for entry in entries if isinstance(entry, dict) and entry.get("TYP") == "F"]
        if len(files) != 1 or files[0].get("PAT") != "Shortcut.wflow":
            fail(path, "authenticated Apple Archive does not contain exactly Shortcut.wflow")
        if not isinstance(files[0].get("DAT"), int) or files[0]["DAT"] <= 0:
            fail(path, "authenticated Shortcut.wflow payload is empty")

    print(f"Verified AEA signature and authenticated Shortcut.wflow payload: {path}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} ARTIFACT.shortcut", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(verify(Path(sys.argv[1])))
