# PROTOTYPE — Shortcut client for the API-first service

## Question

Can the existing iOS Share Sheet pattern call the authenticated API-first
backend directly—without a native app—while preserving the exact source URL and
an idempotency key?

This prototype is intentionally isolated from
`shortcut/Save honeymoon-period.cherri`. The Reminders + Beli baseline remains
unchanged and usable.

## Run the backend locally

```sh
cd prototype/cloudflare-api
npm install
npm run migrate
npm run dev
```

Exercise the Shortcut-shaped request with:

```sh
curl -sS http://127.0.0.1:8788/v1/captures \
  -H 'authorization: Bearer prototype-participant-a' \
  -H 'content-type: application/json' \
  -d '{"source_url":"https://example.com/hp/restaurant-alpha?utm_source=prototype","client_request_id":"manual-fixture-1"}'
```

The fixture token is intentionally public and valid only in disposable local D1
state. Never reuse it for a deployed service.

Build the separate importable Shortcut prototype with:

```sh
./prototype/sites-capture/build-shortcut.sh
```

The signed prototype is written under `.build/prototype-sites-capture/`, never
`dist/`, so it cannot be confused with the supported baseline deliverable.

## Capture contract

The request sends `Authorization: Bearer <participant token>` and:

```json
{
  "source_url": "https://example.com/hp/restaurant-alpha?utm_source=prototype",
  "client_request_id": "client-generated-idempotency-key"
}
```

A new capture returns `201` with the canonical honeymoon-period ID and a capture
that retains the exact source URL. Repeating the same actor/idempotency key
returns `200` with `status: "replayed"`. A different idempotency key with an
equivalent normalized URL adds provenance to the existing honeymoon-period.

The approved implementation uses Cloudflare Workers + D1 with versioned SQL
migrations and one revocable actor-bound token digest per participant. The
source-controlled React-admin web UI consumes the same `/v1` contract. ChatGPT
Sites remains an optional visual prototype over the API, never its source of
truth.
