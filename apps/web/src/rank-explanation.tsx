import type { HoneymoonPeriod } from "@honeymoon-period/generated";

type Rank = HoneymoonPeriod["rank"];

export function PlanningEligibility({ eligible }: { eligible: boolean }) {
  return (
    <span>
      {eligible ? "Eligible for planning" : "Planning unavailable: a participant declined"}
    </span>
  );
}

export function RankExplanation({
  rank,
  label,
  className,
  showFormula = false,
}: {
  rank: Rank;
  label?: string;
  className: string;
  showFormula?: boolean;
}) {
  return (
    <>
      <dl className={className} aria-label={label}>
        <div>
          <dt>Scores</dt>
          <dd>{rank.score}</dd>
        </div>
        <div>
          <dt>Votes</dt>
          <dd>{rank.votes}</dd>
        </div>
        <div>
          <dt>Explicit boost</dt>
          <dd>{rank.boost}</dd>
        </div>
        <div className="rank-total">
          <dt>Total</dt>
          <dd>{rank.total}</dd>
        </div>
        <div>
          <dt>Policy</dt>
          <dd>Preference policy v{rank.policy_version}</dd>
        </div>
        <div>
          <dt>Planning</dt>
          <dd>
            <PlanningEligibility eligible={rank.planning_eligible} />
          </dd>
        </div>
      </dl>
      {showFormula ? (
        <p className="field-help">
          Total = average available score + vote weights + explicit boost.
        </p>
      ) : null}
    </>
  );
}
