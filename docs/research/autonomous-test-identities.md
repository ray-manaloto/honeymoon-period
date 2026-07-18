# Dedicated test identities for autonomous workflows

- Status: researched; human bootstrap and physical test resources still required
- Last verified: 2026-07-15
- Region: United States
- Scope: issue 7's two-participant iOS app/calendar bake-off and future synthetic test work
- Boundary: primary/official sources only; no account, credential, install, OAuth grant, or external state was created

## Recommendation

Create two **long-lived, non-production lab identity stacks**, one controlled by
each actual human participant. Do not create a fresh “disposable” Apple or Google
identity for every task. Each stack should contain:

1. one dedicated mailbox;
2. one unmanaged/personal Apple Account using that mailbox;
3. one ordinary consumer Google Account using a distinct dedicated mailbox;
4. vendor accounts created from that participant's lab Apple, Google, or email
   identity as each product permits;
5. one dedicated empty iCloud calendar and one dedicated empty secondary Google
   calendar; and
6. an isolated physical iPhone test environment for the existing-App-Store-app
   slice, plus an isolated browser profile for web administration.

Each human should create and recover their own accounts, supply accurate required
identity attributes directly to the provider, retain their password and recovery
factors, and perform security-sensitive confirmation prompts. The repository and
Codex agents should receive neither passwords nor one-time codes. After the human
bootstrap, agents may operate already-authenticated, test-only sessions and
synthetic data within the authority granted for the trial.

This is the closest supported design to “autonomous” for the current bake-off.
Apple and Google deliberately retain human-presence and anti-abuse gates around
consumer account creation and authentication. The right optimization is therefore
**one human bootstrap, durable isolated sessions, then agent autonomy**, not bot
account creation or shared credentials.

## Why “lab identity,” not “disposable identity”

**Verified facts**

- Apple limits how many iCloud accounts can be created from a device, requires a
  web-created account to verify its email address and an always-accessible phone
  number, and requires at least one trusted phone number for two-factor
  authentication. Account recovery can take days or longer.
  [Create an Apple Account](https://support.apple.com/en-ie/108647),
  [trusted phone numbers and devices](https://support.apple.com/en-lamr/122621),
  [iCloud terms](https://www.apple.com/legal/internet-services/icloud/en/terms.html)
- Google says many people legitimately have more than one Google Account, but
  prohibits using bots to create fake accounts. Phone verification is sometimes
  required and Google limits how many accounts a phone number can verify. Personal
  accounts can be deleted after two years of inactivity.
  [Disabled-account policy](https://support.google.com/accounts/answer/40695),
  [phone verification](https://support.google.com/accounts/answer/114129),
  [inactive-account policy](https://support.google.com/accounts/answer/12418290)

**Inference**

Repeatedly generating accounts increases provider anti-abuse risk, recovery
burden, stale invitations, and false product failures. A stable lab identity also
lets a later test distinguish first-use behavior from returning-user behavior.

**Recommendation**

Use “dedicated non-production lab account” in future prompts and documentation.
Reserve “sandbox account” for a provider's documented sandbox, and “disposable
fixture” for synthetic records that are safe to delete. Rotate credentials and
reset product data; do not rotate the underlying human identity for every ticket.

## Apple identity types and their actual fit

| Identity type | Supported purpose | App Store app acquisition | iCloud / Calendar | Sign in with Apple | Fit for issue 7 |
| --- | --- | --- | --- | --- | --- |
| Unmanaged/personal Apple Account | A person's ordinary Apple services identity | Yes; free downloads still use the App Store and may require password, Face ID, Touch ID, or device-button confirmation | Yes; private editable calendar invitees need an Apple Account and iCloud | Yes; requires two-factor authentication | **Use one per participant** |
| Managed Apple Account through Apple Business | Organization-owned identity with centrally controlled service access | The identity can browse but cannot acquire free or paid App Store content; an organization must acquire and deploy licenses through managed distribution | Calendar is available but off by default; the organization controls service access | Sign in with Apple at Work & School is supported when enabled by an administrator | Technically possible for parts of the flow, but disproportionate and unable to acquire the candidate apps by itself |
| App Store Connect Sandbox Apple Account | Simulated StoreKit/Apple Pay transaction identity for the developer's own development-signed or TestFlight app | No general-purpose acquisition path | Not an iCloud/calendar identity | Not a documented Sign in with Apple test identity | **Do not use** |
| TestFlight beta tester | Email-addressed invitation to test a developer's beta | Only the invited beta through TestFlight | No special iCloud identity | Uses the tester's normal platform identity where needed | Out of scope: the candidates are production apps, and repository policy excludes TestFlight without approval |
| App Store Connect user | Team member who administers a developer's apps | Not a consumer-app test identity | No special iCloud identity | Requires an existing Apple Account | Not applicable |

### Personal Apple Accounts

**Verified facts**

- Apple says one Apple Account provides access to iCloud, the App Store, and
  Sign in with Apple. Web creation asks for email, date of birth, region, and a
  phone number the person can always access, then verifies both email and phone.
  [Create an Apple Account](https://support.apple.com/en-ie/108647)
- Two-factor authentication needs at least one trusted phone number. A new-device
  or web sign-in can require the password plus a six-digit code from a trusted
  device or number. Apple explicitly tells developers never to share a password
  or six-digit verification code.
  [Trusted phone numbers and devices](https://support.apple.com/en-lamr/122621),
  [developer-account sign-in](https://developer.apple.com/help/account/access/sign-in-to-your-developer-account/)
- Downloading even a free App Store app can require a side-button action,
  Face ID/Touch ID, or the Apple Account password.
  [Download apps on iPhone or iPad](https://support.apple.com/en-mide/102590)
- A private iCloud calendar invitee must have an Apple Account and use iCloud;
  edit access permits creating, editing, and deleting events.
  [Share a calendar on iCloud.com](https://support.apple.com/guide/icloud/share-a-calendar-mm6b1a9479/icloud)
- Sign in with Apple requires the person to be signed in to an Apple Account with
  two-factor authentication enabled. Native apps can use only the Apple Account
  currently signed in to iCloud; device authentication can require Face ID,
  Touch ID, or passcode. Web sign-in may use any Apple Account and requires its
  normal authentication factors.
  [What is Sign in with Apple?](https://support.apple.com/en-us/102609),
  [Authenticating users](https://developer.apple.com/documentation/signinwithapple/authenticating-users-with-sign-in-with-apple)

**Inference**

There is no fully synthetic personal Apple Account: Apple binds an ordinary
account to real human-controlled recovery channels and may ask for accurate age
or identity confirmation. “Synthetic” must describe the calendar, app content,
and vendor activity—not fabricated recovery facts. Those private bootstrap facts
must remain with the participant and outside the repository and agent transcript.

### Managed Apple Accounts and Apple Business

**Verified facts**

- Apple Business creates organization-owned Managed Apple Accounts and supports
  manual creation or user sync through Google Workspace, Microsoft Entra ID,
  OIDC, or SCIM. Apple verifies the organization; current signup requires a human
  administrator's legal name, work email/phone, organization details, email and
  phone codes, CAPTCHA, and acceptance of terms. Verification can take multiple
  business days.
  [Apple Business requirements](https://support.apple.com/guide/business/requirements-axm6d9dc7acf/web),
  [signup and verification](https://support.apple.com/guide/business/sign-up-and-verify-your-organization-axm402206497/web),
  [IdP sync](https://support.apple.com/guide/business/sync-user-accounts-identity-provider-axm526a05814/web)
- Managed Apple Accounts can use Calendar (off by default) and Sign in with Apple
  at Work & School when the administrator permits it. They cannot acquire paid
  **or free** App Store content. Organizations instead obtain app licenses and
  install them through managed distribution/device management.
  [Managed-account service access](https://support.apple.com/guide/business/service-access-with-managed-apple-accounts-axm171b3ee95/web),
  [managed app licenses](https://support.apple.com/guide/business/intro-to-apps-and-books-licenses-axme19b23f7f/web)

**Inference**

Managed Apple Accounts are not a free “QA tenant” shortcut. They introduce an
organization, administrator, possible domain and device-management dependencies,
service-policy variance, and a different Sign in with Apple mode from ordinary
consumer onboarding. That would weaken the bake-off's evidence about the intended
two-person consumer experience.

**Recommendation**

Do not enroll this personal repository in Apple Business solely to provision two
test identities. Reconsider only if the project becomes a verified organization
with managed test devices and needs repeatable fleet-scale deployment.

### App Store Connect sandbox and test identities

**Verified facts**

- Apple's sandbox simulates In-App Purchases and Apple Pay transactions. Sandbox
  Apple Accounts sign into Developer settings for a development-signed app or a
  TestFlight build; they do not replace the normal Media & Purchases account.
  [Sandbox overview](https://developer.apple.com/help/app-store-connect/test-in-app-purchases/overview-of-testing-in-sandbox),
  [StoreKit sandbox testing](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox)
- The App Store Connect API can list, modify, and reset sandbox testers, but
  Apple's current resource documentation directs creation and deletion to the
  App Store Connect UI. The API can automate TestFlight beta-tester invitations,
  which are email invitations for a developer's own app—not personal Apple
  Accounts for general services.
  [Sandbox tester resource](https://developer.apple.com/documentation/appstoreconnectapi/sandbox-testers),
  [Create a beta tester](https://developer.apple.com/documentation/appstoreconnectapi/post-v1-betatesters)

**Recommendation**

Never use an App Store Connect Sandbox Apple Account for Tavola, iCloud Calendar,
or another candidate's Sign in with Apple. It would test the wrong identity plane.

### Simulator versus physical iPhone

**Verified facts**

- Apple documents Simulator as a destination for apps built and run through
  Xcode. App Store installation documentation targets iPhone and iPad. Apple also
  states that Simulator provides limited test coverage and recommends physical
  devices for coverage beyond simulated behavior.
  [Run on simulated or physical devices](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices),
  [testing a beta OS](https://developer.apple.com/documentation/xcode/testing-a-beta-os),
  [download App Store apps](https://support.apple.com/en-mide/102590)

**Inference**

Apple exposes no supported route to install the production third-party App Store
candidates into iOS Simulator. Even where a developer's own app can exercise
Sign in with Apple or EventKit in Simulator, that does not validate the installed
candidate's Share extension, App Store onboarding, biometrics, notifications,
offline transition, or device calendar behavior.

**Recommendation**

Treat one physical iPhone per participant as required for issue 7's native-app
evidence. Simulator remains appropriate later for this repository's own builds,
but cannot substitute for the current production-app bake-off.

## Google identity and Calendar pattern

### Consumer lab accounts

**Verified facts**

- A Google Account may use a new Gmail address or an existing third-party email.
  Account creation asks for personal information; a phone is nominally optional,
  but Google sometimes requires phone verification to confirm a real person.
  [Create a Google Account](https://support.google.com/accounts/answer/27441),
  [verification](https://support.google.com/accounts/answer/114129)
- Google permits legitimate multiple accounts, but says not to use bots to create
  fake accounts. It limits how many accounts a phone number can verify.
  [Disabled-account policy](https://support.google.com/accounts/answer/40695)
- A user can create an empty secondary calendar from the web, retain ownership,
  and share it with a specific account using “Make changes to events.” The owner
  can instead expose only free/busy when event details must remain hidden.
  [Create a calendar](https://support.google.com/calendar/answer/37095),
  [share a calendar](https://support.google.com/calendar/answer/37082)

**Recommendation**

Each participant should manually create and control one ordinary, non-production
Google Account and its mailbox. Create a dedicated secondary calendar rather than
using the account's primary calendar. Share only that secondary calendar between
the two lab accounts. Do not make it public and do not connect any real calendar.

### OAuth projects and test users

**Verified facts**

- An External OAuth app in Testing status is limited to explicitly allowlisted
  test users, with a hard cap of 100. For scopes beyond basic identity, refresh
  tokens normally expire after seven days while the app remains in Testing.
  [OAuth app states](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview),
  [refresh-token expiration](https://developers.google.com/identity/protocols/oauth2)
- Google says OAuth clients cannot be created or modified programmatically; a
  person must use Cloud Console and acknowledge terms. Google requires separate
  clients by platform and the narrowest practical scopes. For Calendar, useful
  boundaries include `calendar.freebusy`, `calendar.events.owned`, and
  `calendar.app.created`, rather than the all-calendar `calendar` scope.
  [OAuth best practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices),
  [Calendar scopes](https://developers.google.com/workspace/calendar/api/auth)
- Service accounts represent workloads, not people, cannot own Google Workspace
  assets, and normally access user data only through a Workspace administrator's
  domain-wide delegation. Google explicitly warns against service-account
  ownership for Calendar data because ownership cannot be transferred.
  [Service accounts](https://docs.cloud.google.com/iam/docs/service-account-overview),
  [server-to-server OAuth](https://developers.google.com/identity/protocols/oauth2/service-account),
  [Calendar API reference](https://developers.google.com/workspace/calendar/api/v3/reference)

**Inference**

A service account cannot stand in for either human participant and would bypass
the consumer consent/onboarding behavior the bake-off is meant to measure. A
Testing-status OAuth project is appropriate for a later custom prototype, but its
seven-day refresh-token behavior must not be mistaken for a product sync defect.

**Recommendation**

For issue 7, use each vendor's normal user OAuth flow against the two dedicated
Google identities. Create a repository-owned Google Cloud OAuth project only if
testing this repository's own API integration becomes an approved task. If that
happens, keep it External/Testing, allowlist exactly the two lab users, request
incremental scopes, and record the seven-day re-consent expectation.

## Vendor accounts and outbound email

**Verified facts from the current candidate set**

- Tavola requires the iPhone app and Sign in with Apple for collaboration; its
  machine-readable export is requested by email.
  [Tavola](https://tavolaapp.com/),
  [privacy and export](https://tavolaapp.com/privacy)
- Soonish documents code-based collaboration with no account and an export by
  email request. The list/code and vendor email are still external state even
  though no identity account is created.
  [Soonish](https://soonish.life/)
- Mapstr offers Apple, Facebook, or email/password sign-in. The current bake-off
  already excludes existing Facebook and production identities.
  [Mapstr FAQ](https://en.mapstr.com/faq)
- Notion supports invited guests and multiple sign-in providers; a guest must
  sign up to access an invitation. Notion Calendar's iCloud connection uses an
  Apple app-specific password and has a broader mail/contact/calendar data
  boundary than a plain shared calendar.
  [Members and guests](https://www.notion.com/help/add-members-admins-guests-and-groups),
  [Notion Calendar account](https://www.notion.com/help/create-a-notion-calendar-account)
- Howbout requires registered users for the two-person invitation/calendar flow.
  [Howbout help](https://howbout.app/get-help/)

**Recommendations**

- Prefer each participant's dedicated mailbox or their lab Apple/Google identity
  according to the product's ordinary path. Do not use Facebook.
- Do not use plus-address aliases as the two participant identities: providers
  may normalize aliases, and both messages would still be controlled by one
  mailbox/person. Aliases are acceptable only for vendor routing inside one
  participant's already-distinct mailbox stack.
- Use a unique strong vendor password unless federated sign-in is the product's
  primary path. Never reuse the Apple or Google password.
- Keep export and support email outbound-only from the dedicated mailbox, use
  synthetic identifiers in the subject/body, save only sanitized results, and
  never include credentials, private URLs, or real calendar details.
- Before a vendor account is deleted, export the synthetic data, revoke connected
  OAuth access, record deletion status, and preserve only the sanitized evidence
  required by the rubric.

## Secret custody for local Codex agents

### Provider facts

- Apple Keychain stores small secrets in an encrypted database and supports
  access controls. Apple recommends Keychain for passwords and cryptographic
  keys.
  [Keychain Services](https://developer.apple.com/documentation/security/keychain-services),
  [storing keys](https://developer.apple.com/documentation/security/storing-keys-in-the-keychain)
- Google requires OAuth client credentials and tokens to remain out of source
  repositories, stored securely/encrypted at rest, revoked when no longer needed,
  and permanently deleted afterward. Google names Keychain Services as the
  appropriate iOS/macOS storage.
  [OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies),
  [OAuth best practices](https://developers.google.com/identity/protocols/oauth2/resources/best-practices)

### Threat-model inference

All root and child agents in a Codex task run under the same local user and share
the workspace. Agent-role names, separate browser profiles, `.gitignore`, and
“do not print” instructions reduce mistakes but are not cryptographic isolation.
Any credential or reusable session that the agent can exercise should be treated
as within that agent's effective authority.

### Required custody rules

1. **Human-held account roots:** passwords, recovery keys, trusted phone numbers,
   one-time codes, passkeys, device passcodes, and biometric confirmations stay
   with the participant. Never paste them into a prompt, terminal, fixture, GitHub
   issue, screenshot, log, or repository file.
2. **Session delegation:** a participant signs into an isolated browser profile
   or physical lab device directly. The agent may use only the resulting test
   session, never extract or reveal its cookies/tokens, and must stop when the
   provider requests password, code, passkey, CAPTCHA, age/terms acceptance, or
   biometric/device confirmation.
3. **Programmatic secrets:** if a later custom integration needs an OAuth token or
   API key, store it in macOS Keychain under a project- and environment-specific
   label outside the repository. Give only the smallest process the ability to
   retrieve it, never echo it, and prefer short-lived credentials. A plain `.env`
   file is not the default secret store.
4. **No shared credentials:** participant A and B must not share one account,
   password, mailbox, recovery channel, or browser profile. Independent identity
   is part of the product evidence.
5. **Rotation and revocation:** rotate on suspected disclosure, revoke OAuth and
   Sign in with Apple/vendor grants after the trial, remove old device/browser
   sessions, and delete synthetic vendor data. Keep the two base lab identities
   only if they will be maintained and periodically exercised.
6. **Sanitized inventory:** keep only opaque labels and state in project docs,
   such as `participant-a Apple ready` or `Google OAuth revoked`. Do not commit
   addresses, account IDs, relay addresses, phone fragments, calendar IDs, client
   secrets, tokens, or recovery metadata.

## Autonomy boundary

| Action | Agent can perform after bootstrap | Human remains required |
| --- | --- | --- |
| Create personal Apple Account | No supported provisioning API; do not automate the web form | Accurate identity details, email/phone codes, terms, 2FA/recovery setup |
| Create consumer Google Account | Do not bot-create; provider may require real-person phone check | Account form, any CAPTCHA/phone verification, recovery setup |
| Install production App Store candidate | Agent may prepare exact app/version checklist and later operate where tooling allows | Physical-device ownership plus side-button, biometric, password, or terms prompts when requested |
| Sign in with Apple | Agent may navigate up to the system authorization sheet | Account/device authentication and consent when the OS asks |
| Google/vendor OAuth | Agent may initiate a documented, narrow flow and verify post-consent state | Consent, reauthentication, CAPTCHA, passkey, 2FA, or warnings that legally/security-wise require the account owner |
| Create synthetic calendars/fixtures | Yes, inside the two preauthorized test identities and empty calendars | No routine intervention after sessions are ready |
| Send invitations and fixture-only export email | Yes, if preauthorized and the recipient/domain is on the explicit trial list | Human only if a provider adds an identity/security prompt or the recipient/scope changes |
| Judge partner burden | No; an agent can collect mechanics but cannot replace a second human participant's experience | Each participant independently performs and reports their assigned onboarding/interaction slice |
| Rotate/revoke sessions and grants | Agent can perform non-sensitive UI/API steps and verify status | Human confirmation for account-root, device, biometric, or recovery changes |

The agent must exhaust safe retries and alternative supported surfaces before
asking for help, but it must not bypass CAPTCHA, automate personal-account
creation, solicit a password/2FA code, weaken security settings, or represent one
operator as two human participants.

## Minimum two-participant architecture

```text
Participant A (real human owner)              Participant B (real human owner)
├─ dedicated mailbox A                       ├─ dedicated mailbox B
├─ personal lab Apple Account A              ├─ personal lab Apple Account B
│  ├─ trusted factor held by A               │  ├─ trusted factor held by B
│  └─ empty iCloud calendar A                │  └─ empty iCloud calendar B
├─ consumer lab Google Account A             ├─ consumer lab Google Account B
│  └─ empty secondary calendar A             │  └─ empty secondary calendar B
├─ vendor accounts/session A                 ├─ vendor accounts/session B
├─ isolated physical iPhone A                ├─ isolated physical iPhone B
└─ isolated browser profile A                └─ isolated browser profile B

                fixture-only invitations and sharing
                A <--------------------------> B

Codex root + bounded subagents
└─ may operate preauthorized authenticated test surfaces and synthetic data
   but receives no account-root credentials, recovery factors, or private data
```

### Bootstrap checklist

This is a human-run setup session, performed once per participant:

- [ ] Create a dedicated mailbox and enable provider-supported 2FA/recovery.
- [ ] Create one personal lab Apple Account with accurate human-supplied data;
      verify email/phone and enable 2FA. Do not expose the details to Codex.
- [ ] Create one consumer lab Google Account manually; complete any real-person
      verification and recovery setup. Do not expose the details to Codex.
- [ ] Sign the Apple Account into the participant's isolated physical iPhone and
      the Google Account into its isolated browser/profile or calendar client.
- [ ] Create empty, private calendars and label them locally as fixture-only.
- [ ] Confirm there are no real contacts, messages, photos, locations, calendars,
      Notes, payment methods, or production accounts in either environment.
- [ ] Install only free candidate apps; decline paid trials, contact upload,
      location access, ad tracking, and broad calendar access unless the canonical
      protocol explicitly requires the permission for the synthetic calendar.
- [ ] Let each human complete account-root, App Store, passkey/2FA, biometric,
      terms, and system-consent prompts. Then leave the test sessions signed in.
- [ ] Record only readiness booleans and product versions in the private run log;
      publish no account address or identifier.

After this checklist, the autonomous goal may run the issue 7 protocol in
`docs/testing/existing-app-bakeoff.md`, stopping only for an unexpected human-only
provider gate or a decision that materially expands scope.

## Risks and unresolved decisions

- **Physical resources:** two eligible iPhones and two actual human participants
  are still required. Accounts alone cannot satisfy the partner-experience gate.
- **Apple recovery privacy:** each lab Apple Account needs a human-accessible
  trusted number and accurate bootstrap facts. Decide who holds each recovery
  factor and how account ownership survives project pauses; do not document the
  values in this repository.
- **Device isolation:** dedicated or reset spare lab iPhones are the safest
  recommendation. Everyday-device use is not established as safe and needs a
  documented isolation plan plus human confirmation before it enters the lab
  boundary.
- **Automation tooling:** current repository simulator tooling cannot install the
  production candidate apps. Physical-device UI automation would need a separate
  approved and validated tool path; manual participant operation remains the
  evidence-preserving default.
- **Provider lockouts:** new Apple/Google accounts and rapid multi-vendor signup
  may trigger anti-abuse checks. A lockout is an environment blocker, not a
  candidate-product failure.
- **OAuth expiry:** a future Google OAuth project in Testing status normally has
  seven-day refresh tokens for Calendar scopes, shorter than the 14-day bake-off.
  Plan re-consent or avoid a custom OAuth prototype during candidate testing.
- **Vendor deletion:** vendors differ in self-service deletion and export timing.
  The trial must record requested, completed, or unverified deletion rather than
  claiming deletion from request submission alone.
- **Retention:** Google may delete a personal lab account after two years of
  inactivity. If the accounts remain after the bake-off, assign a human owner and
  periodic maintenance check or retire them deliberately.

## Sources

All sources below are first-party and were accessed 2026-07-15. Inline links
identify the exact source supporting each claim.

- Apple Support and Apple Developer documentation: Apple Account creation and
  authentication, iCloud Calendar sharing, App Store installation, Sign in with
  Apple, Apple Business/Managed Apple Accounts, StoreKit sandbox, Simulator/Xcode,
  App Store Connect API, and Keychain Services.
- Google Account/Calendar Help and Google Developer/Cloud documentation: consumer
  account creation and abuse controls, secondary calendars and sharing, OAuth app
  states/scopes/token lifecycle, service accounts, and credential storage.
- Candidate first-party product/help/privacy pages for Tavola, Soonish, Mapstr,
  Notion, and Howbout, already routed through the current bake-off research.
