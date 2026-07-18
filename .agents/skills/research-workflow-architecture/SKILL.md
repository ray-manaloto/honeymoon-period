---
name: research-workflow-architecture
description: Orchestrate multi-candidate research and synthesis for improvements to a repository's project instructions, agent profiles, skills, handoffs, tracker conventions, evidence, and verification workflow. Use when the user explicitly asks subagents to investigate several workflow-architecture candidates or requests a durable evidence-backed workflow roadmap.
---

# Research Workflow Architecture

Run an evidence-proportional architecture research program. Produce one
independent report per candidate and one root-owned synthesis. Treat a proposed
Module as a hypothesis until observed evidence passes the deletion test.

Use the repository's `codebase-design` vocabulary exactly: **Module**,
**Interface**, **Implementation**, **Depth**, **Seam**, **Adapter**,
**Leverage**, and **Locality**.

## Choose the operating branch

- **Advisory:** When the user requests recommendations without durable research
  artifacts, remain read-only. Inspect local evidence, answer in the task, and
  ask whether they want a multi-candidate research program before writing or
  delegating.
- **Research program:** When the user explicitly requests orchestration,
  subagents, durable reports, or an evidence-backed roadmap, write only the
  authorized report/index/synthesis surface described below.

An unsettled candidate set is a human selection checkpoint. Present the local
candidate audit and ask the user to select it. Invoke the user-only
`improve-codebase-architecture` skill only when the user explicitly requests
that audit.

## 1. Establish authority and preservation scope

Read the repository's instruction chain before delegation. At minimum inspect:

- root and relevant nested `AGENTS.md` files;
- `CONTEXT.md`, governing plans/specifications, and relevant ADRs;
- documentation router, research workflow/index, handoff template, agent
  profiles, skill inventory, verification contract, and learning records;
- current Git status and complete in-scope untracked inventory;
- relevant tracker state through read-only queries only when a candidate
  concerns tracker authority or remote workflow state.

Record which files own product intent, relevant tracker intent, generated-source policy,
authorization, and final verification. Preserve every existing tracked and
untracked change. Treat research reports and their index/synthesis as the only
permitted writes in the research-program branch. The advisory branch writes
nothing.

**Completion criterion:** authority, dirty-tree scope, protected artifacts, and
permitted research writes are explicit before any child starts.

## 2. Complete the two-lane research preflight

Search the research index, governing decision documents, and saved recent-
practice artifacts before starting new research. Record exactly one status for
each lane:

```text
Research: linked | reused | not needed — <artifact or concrete reason>
Last30Days: linked | reused | not needed — <artifact or concrete reason>
```

The root owns lane routing. Reuse current reports when they answer the same
question. When a material external fact remains missing or unstable, invoke the
project `research` skill for that bounded question and assign its one cited
report to the candidate's `researcher` child. Run Last30Days once at the root
only when recent practitioner techniques could change the approach; candidate
researchers consume the saved result. Verify every consequential community
claim against its owning source.

**Completion criterion:** both lane statuses are canonical, supported, and
available to every candidate researcher.

## 3. Settle the candidate set

Use the user's named candidates as authoritative. When candidates are not yet
settled, present the read-only local audit and stop for selection. Start a
multi-report program only from a user-selected candidate set.

For each selected candidate, define:

- one bounded question;
- one exclusive report path under the repository's research convention;
- local files and existing reports to consume;
- owning primary-source families to consult when external uncertainty exists;
- explicit forbidden side effects and protected paths.

Apply the deletion test during scoping: if removing the candidate would not
redistribute meaningful complexity across callers, research it as a possible
documentation simplification rather than assuming it deserves a Module.

**Completion criterion:** every candidate has a disjoint report path and can be
researched independently.

## 4. Route models and run research waves

Use at most three direct children concurrently and prevent recursive
delegation. Prefer these roles:

| Work | Role and effort |
| --- | --- |
| Local repository mapping only | `explorer`, Terra/low |
| One independent candidate evidence report | `researcher`, Terra/medium |
| Difficult Apple-platform behavior | `ios-specialist`, Sol/high |
| Material architecture-risk review | `reviewer`, Sol/high |
| Final semantic acceptance gate | `verifier`, Terra/medium |
| Mechanical documentation gate | `validator`, Terra/low |

Keep the root on Sol for candidate scoping, overlap resolution, and synthesis.
Run candidate researchers in waves of three. As each finishes, inspect its
report before reusing the slot; launch the next independent candidate without
waiting for the whole wave when safe.

Give each researcher the raw question and sources, not an expected conclusion.
Require it to edit only its assigned report, leave shared indexes to the root,
avoid commits and external writes, and return exact commands, evidence, gaps,
and decisions.

**Completion criterion:** every candidate has an independent evidence report,
its research status is supported, and no two writing agents touched the same
path. New external research is required only when reused/local evidence leaves
material uncertainty.

## 5. Enforce the candidate report contract

Require every report to contain:

1. canonical `Status`, `Research`, and `Last30Days` metadata plus access date;
2. the bounded question and current local evidence with paths and lines;
3. owning primary sources for unstable or external facts;
4. verified facts separated from inference;
5. at least two plausible shapes, including the status quo;
6. codebase-design analysis: Interface, Implementation, Seam, deletion test,
   Depth, Leverage, Locality, and real versus hypothetical Adapters;
7. an evidence-proportional recommendation: immediate correction, conditional
   pilot, defer, or reject;
8. prerequisites and recurrence triggers before implementation;
9. authorization, privacy, preservation, guard, and test implications;
10. residual uncertainty and explicit root/user decisions.

Reject a report that treats a green command as semantic acceptance, a hash as
trusted provenance, planned reviewers as proof of independence, environment
presence as behavioral success, or remote state as product intent.

**Completion criterion:** every report meets all ten items without presuming its
candidate must be implemented.

## 6. Synthesize rather than vote

Read every report completely. Write one root-owned synthesis and update the
research index once. Reconcile contradictions using current local evidence and
owning sources; do not count agent recommendations as votes.

The synthesis must:

- distinguish reproduced failure, control-flow risk, review friction, and
  architectural hypothesis;
- account for guards already added after earlier failures;
- rank immediate state correction separately from new Module implementation;
- make unresolved prerequisites precede any pilot;
- require recurrence evidence when an existing script/template already covers
  the observed failure;
- identify one source of truth for each claim and prevent proposed Modules from
  duplicating hashes, policy, tracker intent, verdicts, or authorization;
- keep diagnostic Interfaces free of installation, signing, deployment,
  publication, tracker mutation, agent spawning, or acceptance decisions;
- when a selected candidate concerns future external mutation, define a safe
  ceremony: fresh snapshot, serialized owner, immediate precondition reads,
  ordered operations, returned identifiers, and postcondition reads.

Prefer a roadmap that simplifies callers after a Module earns its keep. A new
skill should route work; deterministic scripts and schemas should own repeatable
behavior.

**Completion criterion:** the synthesis can justify why each candidate is now,
conditional, deferred, or rejected and names the evidence that would change
that ranking.

## 7. Run fresh independent gates

After integration, reserve fresh direct-child slots for both final gates. Run a
Sol/high `reviewer` first only when material architecture, security, privacy,
data-loss, or persistent disagreement warrants escalation; finish that optional
review before consuming the two reserved final slots.

1. Ask a fresh Terra/medium `verifier` for `ACCEPT` or `REJECT`. It inspects every
   report and the synthesis for factual fidelity, proportionality, overlap,
   vocabulary, privacy, authorization, and missing prerequisites.
2. Ask a fresh Terra/low `validator` for `PASS` or `FAIL`. It checks exact
   changed-path scope, dirty/untracked coverage, whitespace, local links and
   fragments, index uniqueness, canonical metadata, privacy indicators, and
   absence of source/generated/protected-artifact changes.

When verification rejects, make a bounded correction and use a fresh verifier. Rerun
both gates when the correction changes shared synthesis or evidence; rerun the
validator after metadata-only changes. Preserve every rejection and correction
in the root's working reasoning, not as prompt leakage to the fresh agent.

**Completion criterion:** the final integrated artifacts have fresh `ACCEPT`
and `PASS` verdicts with exact evidence and residual risks.

## 8. Hand off the research result

Lead with the synthesized outcome. Link the synthesis and every candidate
report, state the model/effort routing, report the final gates, enumerate current
state drift and pending decisions, and state exactly what changed. Leave the
artifacts uncommitted unless the user separately authorizes Git publication.

Offer the next human decision; do not silently implement a conditional Module
or mutate the tracker.
