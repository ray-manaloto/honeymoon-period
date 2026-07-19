#!/bin/zsh
set -euo pipefail

prototype_dir=${0:A:h}
cd "$prototype_dir"

rm -rf .wrangler/state
npx wrangler d1 migrations apply hp-prototype --local >/dev/null
npx wrangler d1 execute hp-prototype --local --file fixtures/local-actors.sql >/dev/null
npx wrangler dev --local --port 8788 >/tmp/honeymoon-period-worker.log 2>&1 &
worker_pid=$!
trap 'kill $worker_pid 2>/dev/null || true; wait $worker_pid 2>/dev/null || true' EXIT

for _ in {1..40}; do
  curl -fsS http://127.0.0.1:8788/health >/dev/null 2>&1 && break
  sleep 0.25
done

base=http://127.0.0.1:8788
auth_a='authorization: Bearer prototype-participant-a'
auth_b='authorization: Bearer prototype-participant-b'
fixture='https://example.com/hp/restaurant-alpha?utm_source=smoke'

created=$(curl -fsS "$base/v1/captures" -H "$auth_a" -H 'content-type: application/json' \
  -d "{\"source_url\":\"$fixture\",\"client_request_id\":\"smoke-capture-a\"}")
item_id=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["honeymoon_period"]["id"])' <<<"$created")
replayed=$(curl -fsS "$base/v1/captures" -H "$auth_a" -H 'content-type: application/json' \
  -d "{\"source_url\":\"$fixture\",\"client_request_id\":\"smoke-capture-a\"}")
existing=$(curl -fsS "$base/v1/captures" -H "$auth_a" -H 'content-type: application/json' \
  -d '{"source_url":"https://example.com/hp/restaurant-alpha","client_request_id":"smoke-capture-b"}')
invalid=$(curl -sS -o /dev/null -w '%{http_code}' "$base/v1/captures" -H "$auth_a" \
  -H 'content-type: application/json' -d '{"source_url":"file:///private/example","client_request_id":"smoke-invalid"}')

curl -fsS "$base/v1/honeymoon-periods/$item_id/preference-changes" -X POST -H "$auth_a" \
  -H 'content-type: application/json' -d '{"vote":"interested","score":5,"client_request_id":"smoke-preference-a"}' >/dev/null
curl -fsS "$base/v1/honeymoon-periods/$item_id/preference-changes" -X POST -H "$auth_b" \
  -H 'content-type: application/json' -d '{"vote":"maybe","score":3,"client_request_id":"smoke-preference-b"}' >/dev/null
curl -fsS "$base/v1/honeymoon-periods/$item_id/notes" -H "$auth_b" \
  -H 'content-type: application/json' -d '{"body":"Synthetic smoke note"}' >/dev/null
curl -fsS "$base/v1/honeymoon-periods/$item_id" -X PATCH -H "$auth_a" \
  -H 'content-type: application/json' \
  -d '{"title":"Restaurant Alpha","kind":"restaurant","metadata":{"cuisine":"Fixture cuisine"},"rank_boost":2}' >/dev/null

detail=$(curl -fsS "$base/v1/honeymoon-periods/$item_id" -H "$auth_a")
ranked=$(curl -fsS "$base/v1/honeymoon-periods?status=active&sort=rank" -H "$auth_a")
unauthorized=$(curl -sS -o /dev/null -w '%{http_code}' "$base/v1/honeymoon-periods")

CREATED="$created" REPLAYED="$replayed" EXISTING="$existing" DETAIL="$detail" RANKED="$ranked" \
  ITEM_ID="$item_id" INVALID="$invalid" UNAUTHORIZED="$unauthorized" python3 - <<'PY'
import json, os
created = json.loads(os.environ["CREATED"])
replayed = json.loads(os.environ["REPLAYED"])
existing = json.loads(os.environ["EXISTING"])
detail = json.loads(os.environ["DETAIL"])
ranked = json.loads(os.environ["RANKED"])
item_id = os.environ["ITEM_ID"]
assert created["status"] == "created"
assert replayed["status"] == "replayed"
assert existing["status"] == "existing"
assert existing["honeymoon_period"]["id"] == item_id
assert detail["item"]["id"] == item_id
assert len(detail["preferences"]) == 2
assert len(detail["notes"]) == 1
assert len(detail["captures"]) == 2
assert os.environ["INVALID"] == "400"
assert os.environ["UNAUTHORIZED"] == "401"
assert ranked["items"][0]["rank"] == {"score": 4.0, "votes": 3, "boost": 2.0, "total": 9.0}
print("PASS capture/create/replay/dedupe, actor-owned preferences, notes, metadata, rank, URL validation, and auth")
PY
