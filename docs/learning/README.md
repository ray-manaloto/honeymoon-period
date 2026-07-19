# Repository learning registry

This directory records durable lessons learned from implementation, review, and
verification. It is a feedback loop for repository instructions and automated
guards, not model training and not a store for prompts or private product data.

Each accepted entry must include:

- the observed failure or workflow friction;
- whether it was reproduced or inferred from control flow;
- the evidence and affected seam;
- the correction;
- the regression test, script, or instruction that now enforces the lesson;
- promotion targets such as `AGENTS.md`, a skill, agent brief, generator, or
  verification command; and
- a retirement condition.

Every material goal iteration records exactly one retrospective outcome in the append-only
goal log before downstream state changes: `promoted`, `linked`, or `no-new-lesson`. Use
`promoted` only when creating or strengthening a durable entry and its guard, `linked` when
an existing accepted lesson already governs the finding, and `no-new-lesson` with a concrete
reason for routine success or a non-recurring event.

Use [TEMPLATE.md](TEMPLATE.md). Current entries:

- [2026-07-16 web MVP semantic completion audit](2026-07-16-web-mvp-semantic-audit.md)
- [2026-07-16 field-scoped PATCH updates](2026-07-16-field-scoped-patch-updates.md)
- [2026-07-19 autonomous review-repair loop](2026-07-19-autonomous-review-repair-loop.md)
