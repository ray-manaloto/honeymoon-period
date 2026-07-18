# Codex-native secrets management for local development

**Status:** Research complete; implementation decisions remain for grilling
**Last verified:** 2026-07-16
**Scope:** Secure creation, replacement, update, deletion, rotation, synchronization,
and use of developer credentials on this Mac for the honeymoon-period iOS,
macOS, and web work.

## Executive conclusion

Keep the established boundary: Doppler `dotfiles/dev_personal` is the cloud
source of truth, fnox is the local resolution and optional age-cache layer,
and `mde-py secrets` is the only project automation entry point. The intended
age cache is not present in the live fnox configuration, so restoring and
hardening that layer is implementation work, not an assumed fact.
Do not add a second secrets authority, a Doppler MCP server, a fnox MCP server,
or a custom MCP server.

Create one thin project skill after hardening `mde-py`. The skill should
coordinate human-only credential creation and account ceremonies, invoke safe
metadata-only `mde-py` operations, and enforce the rotate-and-revoke sequence.
It should not implement storage, encryption, provider APIs, secret generation,
or synchronization itself.

Use Apple Passwords for human account passwords, passkeys, verification codes,
and recovery credentials. Those are human credentials, not application
secrets, and should not be copied into Doppler merely to make them accessible
to an agent. Apple Passwords is native to the Mac and iPhone, syncs through
iCloud Keychain, and Apple documents that the synced contents are end-to-end
encrypted ([Apple Passwords](https://support.apple.com/en-us/120758),
[iCloud Keychain security](https://support.apple.com/en-gb/guide/security/sec1c89c6f3b/web)).

## Existing architecture and observed state

The local `macos-development-environment` source defines this flow:

```text
Doppler dotfiles/dev_personal
  -> fnox sync --provider age --global
  -> age-encrypted ~/.config/fnox/config.toml cache
  -> controlled process environment
```

`DOPPLER_TOKEN` is bootstrapped from macOS Keychain and the local age private
key is stored with mode `0600`. The unified CLI already implements add/update,
remove, sync, parity validation, bootstrap, and doctor operations. See the
local source at commit `7bf7a554a38ad5868e32fba08880e1814aab416f`:

- [`docs/secrets-workflow.md`](https://github.com/ray-manaloto/macos-development-environment/blob/7bf7a554a38ad5868e32fba08880e1814aab416f/docs/secrets-workflow.md)
- [`src/mde/secrets/manage.py`](https://github.com/ray-manaloto/macos-development-environment/blob/7bf7a554a38ad5868e32fba08880e1814aab416f/src/mde/secrets/manage.py)
- [`src/mde/secrets/doppler.py`](https://github.com/ray-manaloto/macos-development-environment/blob/7bf7a554a38ad5868e32fba08880e1814aab416f/src/mde/secrets/doppler.py)

The installed fnox is `1.30.0`. In this research session, `uv run mde-py
secrets doctor` passed inside the environment repository, while direct use of
the repository's `.venv/bin/mde-py` separately failed at remote
`AGE_PRIVATE_KEY` retrieval even though the local age key and bootstrap token
were present. Tool resolution is inconsistent: the shell's mise Doppler shim is
a native arm64 Mach-O executable, but `uv run which doppler` resolves the
declared Doppler `3.76.0` installation to an incompatible FreeBSD ARM ELF
binary. The Python process itself currently resolves the shim. This path and
environment discrepancy must be fixed before doctor is accepted as a reliable
gate. No secret values were read or displayed during these checks.

### What the earlier Keychain integration actually did

The user's recollection matches an earlier implementation, but that
implementation was a custom replication loop rather than fnox's native sync
model. At revision `168c5b5`, `sync_doppler_to_fnox()` downloaded every Doppler
secret and invoked `fnox set KEY VALUE --provider keychain --global` once per
key. That produced a local Keychain copy of every secret and a corresponding
fnox declaration. The implementation is preserved in the repository's
[`sync.py` history](https://github.com/ray-manaloto/macos-development-environment/blob/168c5b5/src/mde/secrets/sync.py).

Live fnox testing then established that neither `fnox sync --provider
keychain` nor `fnox import --provider keychain` is supported: sync targets must
be encryption providers. The resulting architecture decision explicitly
superseded the proposed Keychain-sync design and changed the implementation to
`fnox sync --provider age --global --force`; see the
[`Architecture A` plan](https://github.com/ray-manaloto/macos-development-environment/blob/7bf7a554a38ad5868e32fba08880e1814aab416f/docs/plans/2026-04-08-secrets-crud-architecture-a.md)
and the current [`sync.py`](https://github.com/ray-manaloto/macos-development-environment/blob/7bf7a554a38ad5868e32fba08880e1814aab416f/src/mde/secrets/sync.py).
fnox's official sync guide likewise defines sync as fetching remote secrets,
re-encrypting them with a local encryption provider, and storing encrypted
fallback values ([fnox sync](https://fnox.jdx.dev/guide/sync.html)).

Restoring the per-secret Keychain mirror would therefore reintroduce a second
complete local copy, custom parity logic, slower N-secret updates, and partial
failure states without gaining native fnox synchronization. The recommended
modern model is:

1. Keep Doppler as the single machine-secret authority.
2. Keep only the minimum bootstrap credential in macOS Keychain, with a
   separate human-controlled recovery copy.
3. Prefer command-scoped injection (`fnox exec` or `doppler run`) and do not
   automatically export every secret to every interactive process. Doppler
   also recommends injection instead of plaintext `.env` files
   ([Doppler CLI installation](https://docs.doppler.com/docs/install-cli)).
4. Retain the age-encrypted fnox cache only where offline development is a real
   requirement; otherwise resolve remotely at command execution time.
5. For CI and deployed workloads, use config-scoped, expiring service tokens
   now and short-lived OIDC identities when an approved plan supports them
   ([Doppler service tokens](https://docs.doppler.com/docs/service-tokens),
   [Doppler OIDC identities](https://docs.doppler.com/docs/service-account-identities)).
6. Keep human passwords, passkeys, verification codes, and recovery material
   in Apple Passwords/iCloud Keychain rather than the developer-secret
   pipeline ([Apple Passwords](https://support.apple.com/en-us/120758)).

This keeps the useful part of the existing pattern—Doppler authority plus
encrypted local availability—while reducing duplicate storage and ambient
secret exposure. It is an incremental hardening of the current architecture,
not a new secrets platform.

## Recommendation matrix

| Capability | Current evidence | Recommendation |
| --- | --- | --- |
| OpenAI/Codex project skill | Skills package repeatable workflow guidance without granting new source-system access; plugins inherit app permissions ([OpenAI plugin model](https://help.openai.com/en/articles/20001256-plugins-in-codex/)). | Build a thin project-only `manage-development-secrets` skill after `mde-py` is hardened. |
| Codex environment filtering | Codex supports `shell_environment_policy.inherit`, `include_only`, `exclude`, and default removal of variables containing `KEY`, `SECRET`, or `TOKEN` ([Codex configuration reference](https://developers.openai.com/codex/config-reference)). | Configure an explicit project policy; do not let the Codex process inherit the full fnox-loaded shell environment. |
| Codex hooks | Codex project hooks can enforce lifecycle policy, but a hook is pattern-based workflow enforcement rather than a secrets isolation boundary. | Extend the existing pre-tool policy to block known secret-reading/output patterns and unsafe `--value` use. Keep the CLI safe without relying on the hook. |
| Codex Browser secure authentication (`browserAuth`) | OpenAI documents that the built-in browser has separate browser state with sign-in, autofill, and password-management support, and directs users to enter credentials in the browser rather than chat ([built-in browser](https://help.openai.com/en/articles/20001277-using-the-built-in-browser-in-the-chatgpt-desktop-app)). Record & Replay separately treats passwords, OTPs, and API keys as sensitive ([Codex/Record & Replay](https://help.openai.com/en/articles/11369540-codex-in-chatgpt)). | Delegate navigation and existing-session use to the native browser authentication path, but pause for human entry at sign-up, password, CAPTCHA, MFA, recovery, consent, and one-time key display. Never treat browser state as the application-secret store, inspect its cookies, or record these steps. |
| OpenAI `openai-platform-api-key` skill | The installed first-party skill uses an encrypted connector handoff and never prints the key, but its current contract writes to a confirmed local env file. | Reuse its credential decision and secure-creation rules, but do not use its file destination while Doppler is the sole authority. Re-evaluate if it gains a provider destination. |
| Doppler CLI and API | The official CLI supports secret management, injection, activity logs, and stdin input. Doppler specifically recommends stdin or interactive input and `--silent` when output is captured ([official CLI](https://github.com/DopplerHQ/cli), [setting secrets](https://docs.doppler.com/docs/setting-secrets)). | Keep. Make the official stdin + `--silent` path the only mutation path used by `mde-py`. |
| fnox | fnox supports Doppler references, age-backed sync, per-secret environment policy, shell integration, and command-scoped execution ([Doppler provider](https://fnox.jdx.dev/providers/doppler), [configuration](https://fnox.jdx.dev/reference/configuration.html)). | Keep. Prefer command-scoped exposure (`env = "exec"` or `false`) over loading all credentials into every interactive process. |
| Official Doppler MCP | `@dopplerhq/mcp-server` `1.0.5` is first-party but explicitly experimental. It exposes secret get/download/update tools and serializes API responses back to the model; Doppler warns that CLI scope flags are not access control ([Doppler MCP](https://docs.doppler.com/docs/mcp), [v1.0.5 source](https://github.com/DopplerHQ/mcp-server/tree/v1.0.5)). | Do not install. It duplicates `mde-py` and makes secret values or mutation arguments model-visible. |
| Official fnox MCP | `fnox mcp` exposes `get_secret`, and its `exec` tool permits agent-controlled commands; fnox explicitly says an agent can run `printenv` or echo a secret ([fnox MCP](https://fnox.jdx.dev/guide/mcp.html)). | Do not configure. It provides audit visibility, not isolation, and is unnecessary for deterministic CRUD. |
| fnox credential leases | fnox `1.30` can vend short-lived AWS, GCP, Azure, Vault, Cloudflare, GitHub App, and GitHub OAuth credentials and revoke supported leases ([fnox leases](https://fnox.jdx.dev/guide/leases)). | Future bounded pilot only after external deployment is approved. Wrap an exact allowlisted command; never expose a general lease-backed shell to Codex. |
| Doppler integrations | The free Developer plan currently includes API/webhooks, reminders, five config syncs, and short activity-log retention; automated rotation and OIDC identities require upgraded plans ([Doppler pricing](https://www.doppler.com/pricing), [rotation](https://docs.doppler.com/docs/secrets-rotation)). Doppler supports GitHub sync and a Cloudflare Worker propagation workflow ([GitHub Actions](https://docs.doppler.com/docs/github-actions), [Cloudflare Workers](https://docs.doppler.com/docs/cloudflare-workers)). | Use Doppler-originated sync only when a deployment target truly needs a copied secret. Do not introduce a reverse sync or second authority. Paid/OIDC/automatic rotation needs separate approval. |
| Apple Passwords | Stores passwords, passkeys, verification codes, and security recommendations across Apple devices with iCloud Keychain ([Apple Passwords](https://support.apple.com/en-us/120758)). | Use for human logins and recovery material. Keep it agent-inaccessible and distinct from application-secret automation. |
| 1Password | Its CLI can inject secrets without plaintext files and service accounts can restrict access to selected vaults ([1Password CLI](https://developer.1password.com/docs/cli/secrets-scripts)). The local architecture records an expired subscription. | Do not reinstall or make it a second authority. Reconsider only if Apple Passwords no longer meets the human credential use case. |
| Repository leak prevention | GitHub push protection blocks recognized secrets before push, while secret scanning inspects repository history ([push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection), [secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning)). | Enable the native GitHub controls where the repository plan permits. A local scanner may supplement them later, but is not part of CRUD. |

## Required hardening before agent-driven writes

These are implementation gaps, not proposed replacements for the architecture.

1. **Stop emitting plaintext.** `add_secret()` currently prints an `export`
   statement containing the new value. Add an agent-safe mode whose stdout and
   stderr contain only key name, operation, target config, and success/failure.
   Human shell wrappers can retain export behavior behind an explicit separate
   mode.
2. **Stop putting values in process arguments.** `doppler_set_secrets()`
   currently builds `KEY=VALUE` argument strings. Pipe one value to
   `doppler secrets set KEY --silent` through stdin, which the official CLI
   supports. Remove or prohibit the public `--value` flag for agent use.
3. **Avoid bulk value reads for inventories.** The current list helper downloads
   every value even when callers only need names. Use the Doppler name/metadata
   surface for bootstrap and parity; reserve value retrieval for the minimum
   doctor comparison that genuinely needs it.
4. **Make tool resolution deterministic.** Pin and validate one native macOS
   Doppler executable. Doctor must report the resolved binary path, version,
   architecture, and safe capability status without showing authentication
   material.
5. **Make partial failure explicit.** Preserve the existing distinction between
   a failed Doppler write and a successful cloud write followed by a failed
   fnox sync. Add an idempotent reconcile command and test both states.
6. **Reduce ambient exposure.** fnox supports `env = "exec"` and `env = false`;
   the Codex configuration independently supports environment inheritance and
   exclusion. Use both layers so a general shell command cannot see all
   secrets. fnox notes that anyone able to run arbitrary shell commands can
   still invoke `fnox get` or `fnox exec`, so OS/tool authorization remains the
   hard boundary ([fnox configuration](https://fnox.jdx.dev/reference/configuration.html)).
7. **Treat deletion and rotation as different operations.** A rotate workflow
   creates a second provider credential, stores and validates it, moves all
   consumers, and only then revokes the old credential. Plain deletion remains
   a destructive, explicitly confirmed action.

## Thin project skill: what to reuse

The skill should be concise and procedural. It should call maintained
capabilities rather than duplicate them:

- `mde-py secrets doctor`, `validate`, `sync`, and the future agent-safe
  create/update/delete operations;
- Doppler's version history, activity log, recurring reminders, and config
  syncs where already available ([Doppler secrets](https://docs.doppler.com/docs/secrets),
  [versioning](https://docs.doppler.com/docs/versioning));
- fnox's existing Doppler provider, age sync, environment controls, and future
  short-lived leases;
- the OpenAI API-key skill's reuse-versus-create gate and prohibition against
  displaying plaintext;
- Codex Browser/Computer Use solely to reach the human takeover point;
- provider-owned documentation for key scope, creation, validation, overlap,
  and revocation.

The skill should support these safe workflows:

1. Inventory names and safe metadata without retrieving values.
2. Decide reuse versus new credential before account or API work.
3. Pause for human account creation, password, MFA, CAPTCHA, consent, billing,
   recovery, and one-time secret entry.
4. Create or replace through a hidden-input, stdin-only `mde-py` command.
5. Validate presence, cache parity, and a provider-specific non-secret health
   check.
6. Rotate by overlap, consumer migration, validation, and revocation.
7. Delete only after naming the key, target, affected consumers, and recovery
   path, then receiving explicit confirmation.
8. Report only redacted evidence and safe metadata.

It should not contain a general shell executor, a secret reader, copied provider
SDK code, encryption code, its own database, or a shared plaintext `.env`
workflow. If deterministic code is needed, improve `mde-py` itself and keep the
skill as the policy/orchestration layer.

## Guardrails

The project Codex configuration should explicitly retain the default
`KEY`/`SECRET`/`TOKEN` exclusions and add project-specific exclusions for
nonstandard credential names. Prefer `inherit = "core"` or a small
`include_only` policy, subject to a focused compatibility test for the build
toolchain. MCP credentials, if any unrelated MCP later needs them, should be
passed only through documented environment-variable indirection; Codex supports
per-server environment whitelists, bearer-token environment variables, tool
allowlists, and per-tool approval modes
([Codex configuration reference](https://developers.openai.com/codex/config-reference)).

The existing pre-tool hook should deny or pause on:

- `mde-py secrets ... --value` and any agent-unsafe export mode;
- `doppler secrets get`, `download`, or non-stdin `set`;
- `fnox get`, `fnox export`, `fnox list --values`, or a general `fnox exec`;
- attempts to display secret-bearing environment variables, Keychain values,
  the fnox cache, age private keys, `.env` files, or browser credential fields;
- secret-changing commands that bypass the project skill and safe CLI;
- any password, MFA, recovery, consent, or paid-service ceremony.

The hook is defense in depth. The safe CLI must remain non-disclosing even if
the hook is absent, misconfigured, or bypassed.

## Installation decision

Install no secrets MCP server, password-manager MCP, additional secret store,
or 1Password tooling for this plan. No custom MCP is warranted: CRUD and sync
are bounded CLI transactions, and MCP would primarily broaden access and place
secret data in model-visible tool arguments or responses.

After the plan is approved, create the project-only skill and harden the
existing `mde-py` implementation. Separately enable native GitHub leak
prevention if it is not already enabled. Keep fnox leases and Doppler target
integrations as future, separately authorized deployment improvements.

## Facts versus inference

All product capability and plan claims above are facts from the linked official
documentation or inspected first-party source as of 2026-07-16. The local
architecture and defects are facts from the cited source revision and
non-secret command results on this Mac. The recommendation to reject MCP,
separate Apple Passwords from Doppler, harden `mde-py`, and create a thin skill
is an architectural inference from those facts and the repository's stated
authorization and no-plaintext requirements.
