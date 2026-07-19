const TRACKING_KEYS = new Set(["fbclid", "gclid", "igshid", "mc_cid", "mc_eid", "si"]);
const VOTE_WEIGHTS = { interested: 2, maybe: 1, decline: -2 } as const;
export const RANKING_POLICY_VERSION = 1 as const;
export type RankingPolicyVersion = typeof RANKING_POLICY_VERSION;
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

export interface PreferenceValues {
  vote: Vote;
  score: number | null;
}
export interface OwnedPreference extends PreferenceValues {
  actorId: string;
  honeymoonPeriodId: string;
}

export function ownedPreference(
  actorId: string,
  honeymoonPeriodId: string,
  input: PreferenceValues,
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
  policyVersion: typeof RANKING_POLICY_VERSION;
  planningEligible: boolean;
  score: number;
  votes: number;
  boost: number;
  total: number;
}

export interface PreferenceRankEvent {
  sequence: number;
  actorId: string;
  policyVersion: number;
  rankBoost: number;
  after: PreferenceValues;
}

export interface HistoricalRank extends RankComponents {
  throughSequence: number;
}

function rankV1(preferences: readonly PreferenceValues[], boost: number): RankComponents {
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
  return {
    policyVersion: RANKING_POLICY_VERSION,
    planningEligible: !preferences.some((preference) => preference.vote === "decline"),
    score,
    votes,
    boost,
    total: score + votes + boost,
  };
}

export function rankForPolicy(
  policyVersion: number,
  preferences: readonly PreferenceValues[],
  boost: number,
): RankComponents {
  switch (policyVersion) {
    case 1:
      return rankV1(preferences, boost);
    default:
      throw new DomainError(`unsupported ranking policy version ${policyVersion}`);
  }
}

export function rank(preferences: readonly PreferenceValues[], boost: number): RankComponents {
  return rankForPolicy(RANKING_POLICY_VERSION, preferences, boost);
}

export function replayRank(
  events: readonly PreferenceRankEvent[],
  throughSequence: number,
): HistoricalRank {
  if (!Number.isSafeInteger(throughSequence) || throughSequence < 1) {
    throw new DomainError("through sequence must be a positive safe integer");
  }
  const included = events
    .filter((event) => event.sequence <= throughSequence)
    .toSorted((left, right) => left.sequence - right.sequence);
  if (included.length === 0) throw new DomainError("no preference snapshot at sequence");
  const preferences = new Map<string, PreferenceValues>();
  for (const event of included) {
    preferences.set(event.actorId, event.after);
  }
  const last = included.at(-1);
  if (!last) throw new DomainError("no preference snapshot at sequence");
  return {
    throughSequence,
    ...rankForPolicy(last.policyVersion, [...preferences.values()], last.rankBoost),
  };
}
