import { describe, expect, it } from "vitest";
import {
  DomainError,
  idempotencyKey,
  normalizeUrl,
  ownedPreference,
  rank,
  rankForPolicy,
  replayRank,
} from "../src";

describe("normalizeUrl", () => {
  it("preserves the source semantics while removing fragments and tracking parameters", () => {
    expect(normalizeUrl("HTTPS://Example.COM/place?a=1&utm_source=chat&fbclid=x#menu")).toBe(
      "https://example.com/place?a=1",
    );
  });
  it.each(["", "file:///tmp/private", "not a URL", `https://example.com/${"x".repeat(4097)}`])(
    "rejects invalid source URL %s",
    (value) => expect(() => normalizeUrl(value)).toThrow(DomainError),
  );
});

describe("idempotencyKey", () => {
  it("scopes a client request to its authenticated participant", () => {
    expect(idempotencyKey("actor-a", "capture-1")).toBe("actor-a\u0000capture-1");
  });
  it.each(["", "x".repeat(101)])("rejects client request id %s", (value) => {
    expect(() => idempotencyKey("actor-a", value)).toThrow(DomainError);
  });
});

describe("ownedPreference", () => {
  it("derives ownership from the authenticated participant", () => {
    expect(ownedPreference("actor-b", "item-1", { vote: "maybe", score: 3 })).toEqual({
      actorId: "actor-b",
      honeymoonPeriodId: "item-1",
      vote: "maybe",
      score: 3,
    });
  });
  it.each([
    [{ vote: "yes", score: 2 }],
    [{ vote: null, score: -1 }],
    [{ vote: null, score: 6 }],
    [{ vote: null, score: Number.NaN }],
  ])("rejects invalid preference %o", (input) => {
    expect(() => ownedPreference("actor-a", "item-1", input as never)).toThrow(DomainError);
  });
});

describe("rank", () => {
  it("dispatches policy v1 through its durable policy implementation", () => {
    expect(rankForPolicy(1, [{ vote: "interested", score: 4 }], 1)).toEqual(
      rank([{ vote: "interested", score: 4 }], 1),
    );
  });

  it("uses average available score plus visible vote weights and boost", () => {
    expect(
      rank(
        [
          { vote: "interested", score: 5 },
          { vote: "maybe", score: 3 },
        ],
        2,
      ),
    ).toEqual({
      policyVersion: 1,
      planningEligible: true,
      score: 4,
      votes: 3,
      boost: 2,
      total: 9,
    });
  });
  it("treats missing values as neutral and decline as minus two", () => {
    expect(
      rank(
        [
          { vote: null, score: null },
          { vote: "decline", score: null },
        ],
        0,
      ),
    ).toEqual({
      policyVersion: 1,
      planningEligible: false,
      score: 0,
      votes: -2,
      boost: 0,
      total: -2,
    });
  });
  it("supports an empty preference list", () => {
    expect(rank([], 1.5)).toEqual({
      policyVersion: 1,
      planningEligible: true,
      score: 0,
      votes: 0,
      boost: 1.5,
      total: 1.5,
    });
  });
});

describe("replayRank", () => {
  it("replays accepted changes through an inclusive household sequence", () => {
    const events = [
      {
        sequence: 3,
        actorId: "actor-a",
        policyVersion: 1,
        rankBoost: 1,
        after: { vote: "maybe" as const, score: 3 },
      },
      {
        sequence: 1,
        actorId: "actor-a",
        policyVersion: 1,
        rankBoost: 1,
        after: { vote: "decline" as const, score: null },
      },
      {
        sequence: 2,
        actorId: "actor-b",
        policyVersion: 1,
        rankBoost: 1,
        after: { vote: "interested" as const, score: 5 },
      },
    ];

    expect(replayRank(events, 2)).toEqual({
      throughSequence: 2,
      policyVersion: 1,
      planningEligible: false,
      score: 5,
      votes: 0,
      boost: 1,
      total: 6,
    });
    expect(replayRank(events, 3)).toEqual({
      throughSequence: 3,
      policyVersion: 1,
      planningEligible: true,
      score: 4,
      votes: 3,
      boost: 1,
      total: 8,
    });
  });

  it.each([0, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid replay sequence %s",
    (throughSequence) => {
      expect(() => replayRank([], throughSequence)).toThrow(
        "through sequence must be a positive safe integer",
      );
    },
  );

  it("rejects a sequence without an accepted preference snapshot", () => {
    expect(() => replayRank([], 1)).toThrow("no preference snapshot at sequence");
  });

  it("rejects events recorded by an unsupported ranking policy", () => {
    expect(() =>
      replayRank(
        [
          {
            sequence: 1,
            actorId: "actor-a",
            policyVersion: 2,
            rankBoost: 0,
            after: { vote: "maybe", score: 3 },
          },
        ],
        1,
      ),
    ).toThrow("unsupported ranking policy version 2");
  });

  it("selects the policy recorded by the snapshot event", () => {
    expect(() =>
      replayRank(
        [
          {
            sequence: 1,
            actorId: "actor-a",
            policyVersion: 1,
            rankBoost: 0,
            after: { vote: "interested", score: 4 },
          },
          {
            sequence: 2,
            actorId: "actor-b",
            policyVersion: 2,
            rankBoost: 1,
            after: { vote: "maybe", score: 2 },
          },
        ],
        2,
      ),
    ).toThrow("unsupported ranking policy version 2");
  });
});
