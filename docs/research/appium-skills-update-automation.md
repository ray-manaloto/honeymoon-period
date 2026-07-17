# Appium skills update automation

- **Status:** Research complete; adoption decision remains for grilling
- **Last verified:** 2026-07-16
- **Question:** How should this repository detect and propose updates to a
  commit-pinned `appium/skills` submodule quickly, and should it use
  Dependabot, Renovate, or an upstream-triggered workflow?

## Recommendation

**Inference.** Use **Dependabot alone** for the Appium submodule, with a
five-field cron schedule that checks hourly at an off-peak minute. Keep every
result as a human-reviewed pull request and prohibit auto-merge.

- Dependabot has first-party, non-beta support for the `gitsubmodule` package
  ecosystem and now accepts custom cron expressions.
- An hourly cron is materially faster than the previously proposed weekly
  check without installing another GitHub App or operating a bot.
- Do not run Renovate and Dependabot against the same submodule. That would
  duplicate discovery, branches, and pull requests.
- Do not build a webhook relay. A downstream repository cannot directly
  subscribe its Actions workflow to `push` events in an unrelated upstream
  repository without upstream cooperation or an external service.
- If an actual requirement later demands less than one-hour detection, replace
  this Dependabot entry with a narrowly scoped scheduled poller; do not layer
  the poller on top of Dependabot.

A suitable proposed schedule is `17 * * * *`, rather than the top of the hour.
This is a plan recommendation only; no configuration was added by this
research.

## Current repository and upstream facts

**Verified locally.** `ray-manaloto/honeymoon-period` is a public repository
whose default branch is `main`. The working tree currently has no tracked
`.gitmodules`, `.github/dependabot.yml`, GitHub Actions workflow, or Renovate
configuration. The Appium submodule and its updater therefore remain planned,
not installed.

**Verified.** `appium/skills` is public, uses `main` as its default branch, and
had no GitHub releases or tags when checked. Its only workflow was a pull
request-title check; it had no workflow that dispatches downstream consumers.
Consequently, updates currently need to follow the latest reviewed commit on
`main`, not a version tag.
[Repository API](https://api.github.com/repos/appium/skills),
[releases API](https://api.github.com/repos/appium/skills/releases),
[tags API](https://api.github.com/repos/appium/skills/tags),
[upstream workflows](https://github.com/appium/skills/tree/main/.github/workflows)

**Verified.** A superproject records a submodule as a specific commit. Git can
also record the desired remote branch in `.gitmodules`; `git submodule update
--remote` fetches that remote and selects the remote-tracking branch rather
than the commit currently recorded by the superproject.
[Git submodule documentation](https://git-scm.com/docs/git-submodule),
[`.gitmodules` documentation](https://git-scm.com/docs/gitmodules)

**Inference.** The planned submodule should track upstream `main` for update
discovery while the superproject continues to pin an exact reviewed gitlink
commit. Tracking a branch does not make local builds float automatically.

## Dependabot frequency and capability

**Verified.** GitHub lists Git submodules as the first-party
`gitsubmodule` Dependabot ecosystem.
[Supported Dependabot ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)

**Verified.** Dependabot's predefined `daily` interval means weekdays only.
GitHub also supports `schedule.interval: cron` with `schedule.cronjob`. The
cron form has five fields beginning with minutes, and GitHub accepts a valid
cron or natural-language expression.
[Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference#schedule),
[GitHub's cron scheduling announcement](https://github.blog/changelog/2025-04-22-dependabot-now-lets-you-schedule-update-frequencies-with-cron-expressions/)

**Important limit.** GitHub does not document a Dependabot service-level
minimum interval or an execution-time guarantee. Five-field cron syntax can
express one-minute granularity, but that is not evidence that Dependabot will
start and complete a job every minute. The defensible conclusion is:

- the old predefined minimum is one weekday (`daily`);
- the current syntactic minimum is one minute through `cron`; and
- hourly is the fastest reasonable operating cadence for this repository,
  not a guaranteed latency SLA.

**Inference.** Dependabot is sufficient for this one dependency. It can inspect
the public upstream without a registry secret and create a PR that changes the
gitlink. An hourly off-peak expression is both simple and responsive.

## Renovate comparison

**Verified.** Renovate supports Git submodules, but its `git-submodules`
manager is currently **beta**, disabled by default, and must be explicitly
enabled. It reads `.gitmodules` and uses the `git-refs` datasource.
[Renovate Git submodules manager](https://docs.renovatebot.com/modules/manager/git-submodules/)

**Verified.** Installing the hosted Renovate GitHub App requires repository
installation and onboarding. The app needs broad read/write permissions for
code, checks, commit statuses, issues, pull requests, and workflows.
[Renovate installation and onboarding](https://docs.renovatebot.com/getting-started/installing-onboarding/),
[Renovate security and permissions](https://docs.renovatebot.com/security-and-permissions/)

**Verified.** Repository `schedule` configuration only gates what Renovate may
do when the bot is already running; it cannot make the backend run sooner.
Renovate does not support exact-minute scheduling and requires at least
one-hour schedule granularity. The free Mend hosted service schedules active
repositories every four hours, while Renovate recommends hourly execution for
self-hosted installations.
[Renovate scheduling](https://docs.renovatebot.com/key-concepts/scheduling/),
[Mend hosted job scheduling](https://docs.renovatebot.com/mend-hosted/job-scheduling/),
[running Renovate](https://docs.renovatebot.com/getting-started/running/)

**Verified.** Renovate defaults to immediate PR creation and
`automerge: false`; it does not require auto-merge.
[Renovate `prCreation`](https://docs.renovatebot.com/configuration-options/#prcreation),
[Renovate `automerge`](https://docs.renovatebot.com/configuration-options/#automerge)

**Inference.** Renovate is not the right addition for this submodule:

- its relevant manager is less mature than Dependabot's supported ecosystem;
- its free hosted cadence is slower than the proposed hourly Dependabot cron;
- self-hosting it hourly only matches the proposed cadence while adding bot,
  token, runtime, and upgrade maintenance; and
- using both would violate this project's existing-capability-first and
  no-duplication policies.

Renovate should be reconsidered only as a deliberate **replacement** for
Dependabot if the repository later needs Renovate-specific policy across many
dependency ecosystems. That migration should give every dependency one owner.

## Can an upstream push trigger this repository directly?

**Verified.** GitHub Actions workflows run for events in their own repository,
manual dispatches, schedules, or an explicitly created
`repository_dispatch`. A `push` to `appium/skills` does not become a `push`
event in `honeymoon-period`.
[Workflow concepts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows),
[workflow trigger events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

**Verified.** Creating a repository webhook requires owner or administrator
access to the repository where events originate. A GitHub App receives webhook
events only for repositories it has been granted access to. This project cannot
install its webhook or GitHub App on `appium/skills` unilaterally.
[Creating webhooks](https://docs.github.com/en/webhooks/using-webhooks/creating-webhooks),
[webhook types](https://docs.github.com/en/webhooks/types-of-webhooks),
[GitHub App repository access](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)

**Verified.** `repository_dispatch` can trigger a downstream workflow, but the
caller must POST to the downstream repository's API. A fine-grained token for
that endpoint needs downstream `Contents: write`; the workflow file must
already exist on the downstream default branch.
[Repository dispatch API](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event),
[repository dispatch event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#repository_dispatch)

**Inference.** A genuinely event-driven path therefore needs one of these:

1. Appium maintainers add an upstream workflow that dispatches this project and
   are trusted with an appropriately scoped downstream credential;
2. Appium maintainers install/configure a webhook or GitHub App that sends to a
   relay owned by this project; or
3. an external service polls upstream and dispatches this project.

All three add cooperation, credentials, or infrastructure that is unnecessary
for an hourly check. A reusable `workflow_call` is not an event subscription;
an upstream caller workflow must explicitly call it.
[Reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)

## Scheduled polling fallback

**Verified.** A downstream Actions workflow may use `schedule`; the shortest
documented Actions interval is five minutes. Scheduled workflows run only from
the default branch, may be delayed or dropped during high load, and are
automatically disabled after 60 days without repository activity in public
repositories.
[Scheduled workflow event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
[scheduled-run delays](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows#scheduled-workflow-runs)

**Inference.** If an explicit sub-hour detection requirement appears, a local
15-minute scheduled poll could compare the pinned gitlink with
`git ls-remote https://github.com/appium/skills.git refs/heads/main` and propose
a PR. Fifteen minutes avoids pretending that GitHub's five-minute minimum is a
delivery guarantee. This fallback should **replace**, not supplement, the
Appium Dependabot entry.

The poller would still not be event-driven. Adding `repository_dispatch` after
the poll would only add a second workflow hop without reducing detection
latency.

## PR-only security and acceptance design

Appium skills contain instructions and executable helper scripts. An updated
commit must be treated like an executable supply-chain change, not a routine
patch version.

**Verified.** Workflows triggered by Dependabot receive a read-only
`GITHUB_TOKEN` by default and cannot access ordinary Actions secrets. GitHub
treats them similarly to fork-originated work.
[Dependabot on Actions](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-on-actions)

**Verified.** GitHub warns against checking out and executing untrusted pull
request or third-party code in a privileged `pull_request_target` or
`workflow_run` context. Tokens should have the minimum required permissions.
[Securely using `pull_request_target`](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target),
[secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)

**Inference.** The future update lane should enforce all of the following:

- create a PR that changes only the Appium submodule gitlink and any explicitly
  derived dependency inventory entry;
- never push the update directly to `main`, auto-approve it, or auto-merge it;
- require a human review of the complete upstream commit range, especially
  changes to `SKILL.md`, `AGENTS.md`, `contexts/`, `tools/`, scripts, licenses,
  and network/process behavior;
- run structural adapter/path checks and the project's policy tests in the
  read-only PR workflow;
- run no physical-device, signing, production-credential, or privileged Mac
  automation as part of an update PR;
- never execute new upstream scripts in a job that has repository write access
  or secrets;
- require branch protection/status checks plus the designated human approval;
  and
- retain the old gitlink in Git so rollback is one reviewed revert.

## Decision for grilling

The next decision is whether the user accepts this operating point:

> Use only Dependabot for `appium/skills`, check hourly at an off-peak minute,
> and require a reviewed PR with no auto-merge. Do not add Renovate or a custom
> poller unless a measured need later establishes a sub-hour update-detection
> requirement.
