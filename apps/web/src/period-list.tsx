import type { HoneymoonPeriod } from "@honeymoon-period/generated";
import { useDeferredValue, useState } from "react";
import { useGetList } from "react-admin";
import { Link } from "react-router-dom";
import { RankExplanation } from "./rank-explanation";
import { ErrorState, LoadingState } from "./state";

type Status = HoneymoonPeriod["status"];

export function PeriodList() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState<Status>("active");
  const [kind, setKind] = useState("");
  const [sort, setSort] = useState("rank");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const { data, isPending, error, refetch } = useGetList<HoneymoonPeriod>(
    "honeymoon-periods",
    {
      pagination: { page: 1, perPage: 50 },
      sort: { field: sort, order },
      filter: { q: deferredQuery, status, kind },
    },
    { retry: false },
  );
  return (
    <div className="page-shell">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Shared shortlist</p>
          <h1>Ranked ideas</h1>
          <p>Every total is additive and visible, so the order never feels mysterious.</p>
        </div>
        <Link className="button primary" to="/capture">
          Save a link
        </Link>
      </header>
      <section className="filter-panel" aria-label="Filter and sort ideas">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or keyword"
          />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as Status)}>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>
        </label>
        <label>
          <span>Kind</span>
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="">All kinds</option>
            <option value="restaurant">Restaurant</option>
            <option value="event">Event</option>
            <option value="activity">Activity</option>
          </select>
        </label>
        <label>
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="rank">Rank</option>
            <option value="newest">Newest</option>
            <option value="title">Title</option>
          </select>
        </label>
        <button
          type="button"
          className="button quiet"
          onClick={() => setOrder((value) => (value === "ASC" ? "DESC" : "ASC"))}
          aria-label={`Sort ${order === "ASC" ? "descending" : "ascending"}`}
        >
          {order === "ASC" ? "Ascending ↑" : "Descending ↓"}
        </button>
      </section>
      {isPending ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} retry={() => void refetch()} />
      ) : data?.length ? (
        <ol className="idea-grid" aria-label="Ranked honeymoon-periods">
          {data.map((item, index) => (
            <li key={item.id} className="idea-card">
              <div className="rank-number">
                <span className="sr-only">Rank </span>
                {index + 1}
              </div>
              <div className="idea-copy">
                <div className="card-kicker">
                  <span>{item.kind}</span>
                  <span>{item.status}</span>
                </div>
                <h2>
                  <Link to={`/honeymoon-periods/${item.id}/show`}>{item.title}</Link>
                </h2>
                <RankExplanation
                  rank={item.rank}
                  className="rank-breakdown"
                  label={`Rank explanation for ${item.title}`}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="state-panel empty-state">
          <h2>No ideas match these filters yet.</h2>
          <p>Try another status, or save a link to start the shortlist.</p>
          <Link className="button primary" to="/capture">
            Save the first link
          </Link>
        </div>
      )}
    </div>
  );
}
