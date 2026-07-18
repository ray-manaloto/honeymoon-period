# Lab identities and synthetic external state

- Status: approved standing convention
- Approved: 2026-07-15
- Applies to: external products, providers, calendars, OAuth, invitations, and
  fixture-only email used by repository tasks
- Does not apply to: code, documentation, or local tests that need no external
  identity or state
- Research basis:
  [dedicated test identities](../research/autonomous-test-identities.md)

## Identity architecture

Use one reusable **lab identity suite**, not newly disposable identities for
each task. It contains two long-lived, non-production identity stacks:

- Participant A owns mailbox, personal Apple, consumer Google, vendor, calendar,
  browser, and device identities for stack A.
- Participant B independently owns the equivalent stack B.
- Each participant retains their own passwords, recovery methods, trusted
  factors, passkeys, biometrics, and account-root decisions.
- Accounts and calendars contain only synthetic test data. Do not connect real
  contacts, calendars, messages, photos, locations, Notes, payment methods, or
  production identities.

Use provider-specific lab accounts rather than one shared universal credential.
Reserve **sandbox account** for a provider's documented sandbox and
**disposable fixture** for synthetic records that are safe to delete.

## Standing bounded authorization

After the human owners bootstrap and authenticate the lab environments, the
root agent and its bounded subagents may autonomously:

- install and test free apps on isolated lab devices when supported tooling is
  available;
- create, modify, export, and delete synthetic fixtures and calendars;
- create vendor test accounts through the approved lab identities when the flow
  does not cross a human-only ceremony;
- send fixture-only invitations and vendor export or deletion email between
  explicitly scoped trial participants and vendors;
- initiate least-privilege OAuth connections and revoke grants afterward;
- operate preauthenticated lab browser or device sessions without extracting
  credentials, cookies, or tokens; and
- exhaust safe retries and supported alternatives before requesting one batched
  human checkpoint.

This authorization includes physical-device testing inside the lab boundary. It
does not assert that suitable devices, participants, or automation tooling are
currently available.

## Human-only ceremonies

Stop at the narrowest possible checkpoint when a provider or operating system
requires a password, passkey, account recovery, CAPTCHA, two-factor code,
biometric or device confirmation, terms acceptance, OAuth/system consent, or
another account-owner security decision. A human participant also remains
required for subjective partner-experience judgments and must independently
perform any interaction used as evidence of two-person burden.

Never ask a participant to paste a secret into a prompt or terminal. Record only
sanitized readiness state, product versions, fixture identifiers, and test
outcomes.

## Actions requiring separate approval

The standing authorization does not cover:

- paid services, purchases, trials that can convert to paid, or payment methods;
- production credentials, production data, or real private information;
- public publication or communication outside the explicit fixture/vendor flow;
- TestFlight, App Store distribution, or production deployment;
- weakening security controls, bypassing provider anti-abuse systems, or
  automating consumer Apple or Google account creation; or
- representing one operator, account, or device as two independent human
  participants.

## Agent handoff rule

When human intervention is irreducible, report one batched checkpoint containing
the exact owner, surface, requested action, expected result, and safe resumption
state. Continue all independent work first. A provider lockout or missing lab
resource is an environment blocker, not a product failure.
