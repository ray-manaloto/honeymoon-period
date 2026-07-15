# Reminders + Beli prototype findings

- Status: implementation verified; device observations are user-reported
- Last verified: 2026-07-15

## Question

What has the baseline workflow proved, and which gaps should the bake-off test?

## Verified from repository source

- The Shortcut accepts URL, text, rich text, and webpage Share Sheet inputs with clipboard fallback.
- It recognizes Instagram, Yelp, OpenTable, Tock, Resy, and general websites.
- It expands Yelp redirects and Adjust wrappers, removes common tracking parameters, and stabilizes Yelp business URLs.
- It attempts page-title enrichment, provides source-specific fallback naming, and preserves the normalized URL and source in Reminders notes.
- It searches for an exact normalized-URL marker before adding a reminder.
- It asks each installer for an added-by name and shared Reminders list.
- The workflow has no project backend, analytics, paid API, or account token.

The structural verifier confirms generated actions and fields. Structural verification is not proof of end-to-end iPhone behavior.

## User-observed cases from the prototype session

- An Instagram Shinya link later produced an “already saved” notification.
- A Yelp link was added.
- OpenTable, Resy (Meadowlark), Tock (the Aviary URL), and a restaurant website were shared and added.
- The partner accepted the shared list/invitation.

These observations lack retained screenshots, iOS versions, exact fixtures, and two-device synchronization logs. Preserve them as observations, not formal pass results; add future evidence to [`docs/testing/prototype-evidence.md`](../testing/prototype-evidence.md).

## Known limitations

- The partner needs a personalized Shortcut install in addition to the Reminders invitation, which misses the desired one-app-plus-invite target.
- Reminders sections are not directly selectable through the generated Shortcut action.
- Instagram and other sources may block metadata and require manual naming.
- Exact-URL duplicate detection does not merge different links for the same venue and depends on Reminders/Spotlight indexing.
- Independent scores, rich structured metadata, consensus ranking, and calendar availability are not native to this baseline.
- Recurring happy hour remains notes-only until a specific occurrence is selected.

## Existing upgrade hypotheses

Bad titles or venue duplicates suggest a resolver; structured fields suggest a database tool; availability friction suggests a calendar service; independent scoring, urgency, comments, and venue identity may justify a dedicated app. These are hypotheses to test, not approved architecture.
