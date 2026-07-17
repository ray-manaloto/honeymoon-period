# Future Sites UI prompt

Use this only after the API is deployed and a production Sites deployment is
separately approved. First ask Sites to save a reviewable version without
deploying it.

```text
Build a minimal private honeymoon-period UI using the recommended Sites starter.
Treat the separately deployed honeymoon-period API as the source of truth.

The first UI slice has exactly two surfaces:
1. List active honeymoon-period records from GET /v1/honeymoon-periods.
2. Show one record, its notes, metadata, actor-owned preferences, and explicit
   rank components.

Do not duplicate API-owned persistence or ranking logic in Sites. Do not call an
AI model, fetch or enrich source URLs, access calendars, accept uploads, or add
unrelated features. Use only synthetic fixtures during review.

Keep access limited to invited reviewers. Before saving the version, explain how
the Site will authenticate to the API without exposing an actor or provider
credential to visitors. Never place secrets in source, prompts, Site content, or
.openai/hosting.json.

Save a reviewable version. Do not deploy it.
```
