# Link capture and enrichment

- Status: current Shortcut baseline documented; external API and terms research pending
- Last verified: 2026-07-15

## Current behavior

Canonical implementation: [`shortcut/Save Date Idea.cherri`](../../shortcut/Save%20Date%20Idea.cherri).

- Extract the first URL from shared input.
- Resolve known Yelp wrapper/redirect formats.
- Remove fragments and common attribution parameters while retaining source-specific identity.
- Detect source from the normalized host.
- Attempt title metadata and fall back to a readable source/path or editable prompt.
- Deduplicate only by the normalized URL marker.
- Preserve the URL and provenance even when enrichment fails.

## Research gaps

- Provider-supported canonical URL, metadata, and public API options.
- Login-wall and anti-bot behavior, especially Instagram.
- Address, cuisine, hours, happy-hour, and event-date extraction accuracy.
- Redirect safety and URL unshortening privacy.
- Venue/event identity across Instagram, Yelp, booking services, and official sites.
- API terms, caching rules, quotas, attribution, pricing, and deletion requirements.
- Whether enrichment should run synchronously, in the background, or only on demand.

## Product invariant

Enrichment failure must never block capture. Store provenance and explain uncertain metadata so users can correct it.
