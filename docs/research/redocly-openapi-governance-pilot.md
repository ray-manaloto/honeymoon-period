# Redocly OpenAPI governance deletion-test pilot

**Question.** Can a current local-only Redocly CLI replace meaningful handwritten
OpenAPI governance in this repository without weakening the canonical contract?

**Status:** complete; reject adoption
**Last verified:** 2026-07-18
**Research:** linked — official Redocly documentation and the pinned local pilot below
**Last30Days:** not needed — deterministic local behavior and owning documentation
govern this dependency decision; practitioner anecdotes cannot establish parity.

## Primary-source gate

Redocly CLI is MIT-licensed, supports OpenAPI 3.1, and documents Node 22.12.0 or
20.19.0 as its v2 minimum. It collects usage data by default; the owning
documentation provides `REDOCLY_TELEMETRY=off`, and the project also set
`REDOCLY_SUPPRESS_UPDATE_NOTICE=true` during every invocation.
([repository and README](https://github.com/Redocly/redocly-cli),
[usage data](https://redocly.com/docs/cli/usage-data),
[v2 migration](https://redocly.com/docs/cli/guides/migrate-to-v2))

The 2026-07-13 official changelog identifies 2.39.0 as the current release screened
for this pilot. Redocly's lint documentation says the `spec` ruleset validates
specification structure, while recommended rules add Redocly policy.
([changelog](https://redocly.com/docs/cli/changelog),
[lint](https://redocly.com/docs/cli/commands/lint))

## Bounded local pilot

The worktree had no installed Redocly CLI executable. The lockfile and installed
`openapi-typescript` dependency included `@redocly/openapi-core@1.34.17`, but that
library is not the Redocly CLI evaluated by this pilot.
The governing bootstrap authorized a project dependency only for this deletion test,
so the root installed exact `@redocly/cli@2.39.0`, ran local files only with telemetry
and update notices disabled, then uninstalled it. No Redocly configuration, dependency,
or generated output remains in the repository.

Commands and observations:

```text
npm install --save-dev --save-exact @redocly/cli@2.39.0
# 367 packages added; zero reported vulnerabilities

REDOCLY_TELEMETRY=off REDOCLY_SUPPRESS_UPDATE_NOTICE=true \
  ./node_modules/.bin/redocly lint openapi/v1.json --extends=spec --format=json
# 0 errors; repeated output SHA-256 was identical:
# 4115f9ccb6e71138a5a1d17b9d4a43353abacdfd14c83d9c0839dd0dc7772f09
```

Four temp-only deletion variants produced:

| Variant | `spec` result | Required repository result |
| --- | --- | --- |
| Remove `500` from `POST /captures` | pass | fail |
| Remove `404` from `GET /honeymoon-periods/{id}` | pass | fail |
| Remove `operationId` from `POST /captures` | pass | fail |
| Duplicate `createCapture` on the list operation | fail | fail |

`recommended` and `recommended-strict` rejected the canonical contract with seven
or eight unrelated policy errors. Their error totals did not change for the missing
`404` or `500`; they therefore cannot supply the product-owned emitted-status matrix.

The existing local baseline remained green:

```text
node scripts/check-openapi-responses.mjs
node --test --test-name-pattern='OpenAPI response audit' tests/tooling.test.mjs
# canonical plus four deletion fixtures pass (5/5)
```

## Deletion-test decision

Reject Redocly for this repository. It can replace generic structural parsing and one
duplicate-operation-ID check, but it cannot infer the Worker's required
`400`/`401`/`429`/`500` matrix or resource `404`s. Achieving parity would require
custom Redocly rules that restate the existing small domain checker while retaining its
tests, and the CLI adds hundreds of packages. Complexity moves into configuration and
dependency coupling instead of being deleted.

Keep `scripts/check-openapi-responses.mjs`, its deletion fixtures, native D1 migrations,
`openapi-typescript`, Ajv, generated drift checks, and Worker integration tests. Revisit
only if a maintained tool gains first-class emitted-status policy that deletes the
custom matrix without a replacement plugin or second schema authority.

## Residual boundary

No OpenAPI linter establishes runtime emitted statuses, differing-payload idempotency,
orphan visibility, UI landmark structure, or phone overflow behavior. Those remain
separate semantic and integration gates.

The summarized command output above is the retained pilot record; raw install and lint
logs were not committed. No claim is made that npm lifecycle scripts were disabled.
