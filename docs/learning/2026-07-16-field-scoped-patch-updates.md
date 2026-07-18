# 2026-07-16: Partial updates must not rewrite omitted fields

- Status: accepted
- Scope: honeymoon-period PATCH concurrency
- Evidence type: control-flow risk

## Observation

The Worker read a complete honeymoon-period row, merged one PATCH body into that
snapshot, and rewrote every mutable column. Two participants changing different
fields could therefore race: the later stale full-row write could erase the
other participant's already accepted change.

## Evidence

Independent standards review identified the read/merge/full-write sequence in
`apps/api/src/worker.ts`. The local workerd/D1 scheduler serialized the bounded
`Promise.all` reproduction before both requests completed their reads, so the
bad interleaving was not locally reproduced. The old control flow nevertheless
made the lost-update interleaving possible because omitted fields appeared in
the SQL `SET` list with snapshot values.

## Correction

The PATCH handler now validates each supplied field and builds one atomic SQL
`UPDATE` containing only those fields plus `updated_at`. Omitted fields never
enter the write statement, so a request cannot erase a concurrent change it did
not carry.

## Enforcing guard

- Worker integration coverage concurrently PATCHes different fields through
  the public `/v1/honeymoon-periods/{id}` seam and verifies both through GET.
- Code review checks that PATCH assignments remain field-scoped rather than
  restoring stale read/merge/full-row writes.
- `npm run test:integration` and `npm run check` retain the public regression.

## Promoted instructions

The semantic review gate in `AGENTS.md` already requires concurrency findings
to be labeled as reproduced failures or control-flow risks. This lesson applies
that rule to partial-update behavior without adding a second instruction.

## Residual risk

The local scheduler does not force the production interleaving, so the
concurrent regression is scheduler-sensitive. Field-scoped SQL is the primary
control-flow guarantee. Future multi-record mutations may need transactions or
optimistic versioning rather than this single-row technique.

## Retirement condition

Retire or replace this entry when generated partial-update SQL or an optimistic
version contract makes omitted-field preservation structural and its generated
concurrency suite becomes the authoritative guard.
