import { describe, expect, it } from "vitest";
import { DomainError, idempotencyKey, normalizeUrl, ownedPreference, rank } from "../src";

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
  it("uses average available score plus visible vote weights and boost", () => {
    expect(
      rank(
        [
          { vote: "interested", score: 5 },
          { vote: "maybe", score: 3 },
        ],
        2,
      ),
    ).toEqual({ score: 4, votes: 3, boost: 2, total: 9 });
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
      score: 0,
      votes: -2,
      boost: 0,
      total: -2,
    });
  });
  it("supports an empty preference list", () => {
    expect(rank([], 1.5)).toEqual({ score: 0, votes: 0, boost: 1.5, total: 1.5 });
  });
});
