const TRACKING_KEYS = new Set(["fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "si"]);
const VOTE_WEIGHTS = { interested: 2, maybe: 1, decline: -2 } as const;
export type Vote = keyof typeof VOTE_WEIGHTS | null;

export class DomainError extends Error {}

export function normalizeUrl(value: string): string {
  if (value.length < 1 || value.length > 4096) throw new DomainError("invalid source URL length");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DomainError("source URL must be absolute");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new DomainError("source URL must use http or https");
  }
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    const lower = key.toLowerCase();
    if (lower.startsWith("utm_") || TRACKING_KEYS.has(lower)) url.searchParams.delete(key);
  }
  url.hostname = url.hostname.toLowerCase();
  return url.toString();
}

export function idempotencyKey(actorId: string, clientRequestId: string): string {
  if (clientRequestId.length < 1 || clientRequestId.length > 100) {
    throw new DomainError("client request id must be between 1 and 100 characters");
  }
  return `${actorId}\u0000${clientRequestId}`;
}

export interface PreferenceInput {
  vote: Vote;
  score: number | null;
}
export interface OwnedPreference extends PreferenceInput {
  actorId: string;
  honeymoonPeriodId: string;
}

export function ownedPreference(
  actorId: string,
  honeymoonPeriodId: string,
  input: PreferenceInput,
): OwnedPreference {
  if (input.vote !== null && !(input.vote in VOTE_WEIGHTS)) throw new DomainError("invalid vote");
  if (
    input.score !== null &&
    (!Number.isFinite(input.score) || input.score < 0 || input.score > 5)
  ) {
    throw new DomainError("score must be null or a number from 0 through 5");
  }
  return { actorId, honeymoonPeriodId, vote: input.vote, score: input.score };
}

export interface RankComponents {
  score: number;
  votes: number;
  boost: number;
  total: number;
}

export function rank(preferences: readonly PreferenceInput[], boost: number): RankComponents {
  let scoreTotal = 0;
  let scoreCount = 0;
  let votes = 0;
  for (const preference of preferences) {
    if (preference.score !== null) {
      scoreTotal += preference.score;
      scoreCount += 1;
    }
    if (preference.vote !== null) votes += VOTE_WEIGHTS[preference.vote];
  }
  const score = scoreCount === 0 ? 0 : scoreTotal / scoreCount;
  return { score, votes, boost, total: score + votes + boost };
}
