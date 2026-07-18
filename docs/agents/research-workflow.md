# Research routing workflow

Use this workflow before material product, architecture, implementation,
testing, tooling, security, privacy, provider, or platform work. It coordinates
the existing `research` and `last30days` skills; it does not replace or restate
either skill.

## Required preflight

1. Search `docs/research/README.md`, the governing plan/ADR, and saved
   Last30Days reports under `.build/research/last30days` before starting a new
   search.
2. Record one line for each lane in the task plan, ticket, handoff, or agent
   brief:

   ```text
   Research: linked | reused | not needed — <artifact or reason>
   Last30Days: linked | reused | not needed — <artifact or reason>
   ```

3. Use the project `research` skill when a material external fact is missing,
   unstable, disputed, unfamiliar, or could change the decision. One research
   agent owns one cited report under `docs/research/`; update the index.
4. Also use the project `last30days` skill when recent practitioner tips,
   tricks, techniques, failure modes, adoption, or recommendations could change
   the approach. Keep raw output under `.build/research/last30days`.
5. Reconcile the lanes. Community evidence nominates questions and techniques;
   owning primary sources verify consequential facts. Carry only verified
   implications into plans, ADRs, code, or test contracts.

## Reuse before rerunning

Reuse a current report when it answers the same question and no relevant source,
version, policy, price, limit, or project assumption has changed. The root
coordinator runs each required research lane once and gives implementers the
artifact paths. Child agents consume those artifacts and report uncovered
uncertainty instead of launching duplicate searches.

Do not start new research for deterministic execution of an approved plan,
generated-file regeneration, formatting, routine verification, local source
inspection, index/link maintenance, or a locally reproduced fix whose cause and
remedy are fully established by repository evidence. If one external assumption
remains, research only that assumption.

## Authorization and evidence boundaries

- Prefer primary and authoritative sources, record access dates, and separate
  verified facts from inference.
- Treat Last30Days as discovery, not technical authority. Verify material claims
  against the owning source.
- Default Last30Days to already configured, credential-free or previously
  authorized sources. Browser-cookie access, new credentials, paid/PAYG quota,
  optional installations, user-home writes, and publishing require the approval
  defined in `AGENTS.md`.
- Do not place private URLs, credentials, partner data, calendars, addresses, or
  relationship data in research artifacts or logs.

## Review gate

Reviewers and verifiers check the two preflight lines and the linked evidence
for every material decision. `not needed` is acceptable only with a concrete
mechanical or already-researched reason. Validators remain mechanical and do not
infer research compliance from green commands.

The `PreToolUse` hook stays limited to objectively detectable safety rules. It
cannot determine material uncertainty, intercept every research tool, or prove
that the appropriate evidence was consulted; it is not a semantic research
gate.
