import type {
  HoneymoonPeriod,
  Note,
  Preference,
  PreferenceChangeInput,
} from "@honeymoon-period/generated";
import { useRef, useState } from "react";
import { useDataProvider, useGetOne, useUpdate } from "react-admin";
import { Link, useParams } from "react-router-dom";
import {
  ACTOR_STORAGE_KEY,
  ACTORS,
  type HoneymoonDataProvider,
  type HoneymoonPeriodView,
  type HoneymoonRecord,
} from "./data-provider";
import { ErrorState, errorMessage, LoadingState } from "./state";

function currentActor() {
  const token = localStorage.getItem(ACTOR_STORAGE_KEY) ?? ACTORS[0].token;
  return ACTORS.find((actor) => actor.token === token) ?? ACTORS[0];
}

function actorName(id: string): string {
  return ACTORS.find((actor) => actor.id === id)?.name ?? id;
}

function PreferenceForm({
  id,
  preference,
  done,
}: {
  id: string;
  preference: Preference | undefined;
  done: () => void;
}) {
  const provider = useDataProvider<HoneymoonDataProvider>();
  const [vote, setVote] = useState<PreferenceChangeInput["vote"]>(preference?.vote ?? null);
  const [score, setScore] = useState(preference?.score?.toString() ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const pendingRequest = useRef<{ fingerprint: string; id: string } | undefined>(undefined);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const numericScore = score === "" ? null : Number(score);
    if (
      numericScore !== null &&
      (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 5)
    ) {
      setError(new Error("Score must be a whole number from 0 to 5."));
      return;
    }
    setBusy(true);
    setError(undefined);
    setSaved(false);
    const trimmedReason = reason.trim();
    const fingerprint = JSON.stringify([vote, numericScore, trimmedReason]);
    if (pendingRequest.current?.fingerprint !== fingerprint) {
      pendingRequest.current = { fingerprint, id: crypto.randomUUID() };
    }
    try {
      await provider.createPreferenceChange(id, {
        vote,
        score: numericScore,
        client_request_id: pendingRequest.current.id,
        ...(trimmedReason ? { reason: trimmedReason } : {}),
      });
      pendingRequest.current = undefined;
      setSaved(true);
      done();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      className="inline-form"
      aria-label="Your preference"
      onSubmit={(event) => void submit(event)}
    >
      <div className="form-grid two-column">
        <label>
          <span>Vote</span>
          <select
            value={vote ?? ""}
            onChange={(event) =>
              setVote((event.target.value || null) as PreferenceChangeInput["vote"])
            }
          >
            <option value="">No vote</option>
            <option value="interested">Interested</option>
            <option value="maybe">Maybe</option>
            <option value="decline">Decline</option>
          </select>
        </label>
        <label>
          <span>Score (0–5, optional)</span>
          <input
            type="number"
            min="0"
            max="5"
            step="1"
            value={score}
            onChange={(event) => setScore(event.target.value)}
          />
        </label>
        <label className="full-width">
          <span>Reason (optional)</span>
          <input
            type="text"
            maxLength={1000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {errorMessage(error).detail}
        </p>
      ) : null}
      {saved ? (
        <p className="field-help" role="status">
          Your preference was saved.
        </p>
      ) : null}
      <button className="button primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save preference"}
      </button>
    </form>
  );
}

function MetadataForm({ item, done }: { item: HoneymoonPeriod; done: () => void }) {
  const [update, { isPending }] = useUpdate<HoneymoonRecord>();
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: item.title,
    kind: item.kind,
    status: item.status,
    rank_boost: String(item.rank_boost),
    cuisine: String(item.metadata.cuisine ?? ""),
    address: String(item.metadata.address ?? ""),
    timing: String(item.metadata.timing ?? ""),
    special: String(item.metadata.special ?? ""),
    decline_reason: String(item.metadata.decline_reason ?? ""),
    special_date: String(item.metadata.special_date ?? ""),
  });
  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setForm((current) => ({ ...current, [name]: event.target.value })),
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError(new Error("Title is required."));
      return;
    }
    setError(undefined);
    const metadata = { ...item.metadata };
    for (const name of [
      "cuisine",
      "address",
      "timing",
      "special",
      "decline_reason",
      "special_date",
    ] as const) {
      const value = form[name].trim();
      if (value) metadata[name] = value;
      else delete metadata[name];
    }
    update(
      "honeymoon-periods",
      {
        id: item.id,
        data: {
          title: form.title.trim(),
          kind: form.kind.trim(),
          status: form.status,
          rank_boost: Number(form.rank_boost),
          metadata,
        },
        previousData: item,
      },
      {
        onSuccess: () => {
          setSaved(true);
          done();
        },
        onError: setError,
      },
    );
  };
  return (
    <form className="inline-form" aria-label="Edit details" onSubmit={submit}>
      <div className="form-grid two-column">
        <label>
          <span>Title</span>
          <input required {...field("title")} />
        </label>
        <label>
          <span>Kind</span>
          <input {...field("kind")} />
        </label>
        <label>
          <span>Status</span>
          <select {...field("status")}>
            <option value="active">Active</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
          </select>
        </label>
        <label>
          <span>Rank boost</span>
          <input type="number" step="1" {...field("rank_boost")} />
        </label>
        <label>
          <span>Cuisine</span>
          <input {...field("cuisine")} />
        </label>
        <label>
          <span>Address</span>
          <input {...field("address")} />
        </label>
        <label>
          <span>Timing</span>
          <input {...field("timing")} />
        </label>
        <label>
          <span>Special date</span>
          <input type="date" {...field("special_date")} />
        </label>
        <label className="full-width">
          <span>Special</span>
          <textarea rows={2} {...field("special")} />
        </label>
        <label className="full-width">
          <span>Decline reason</span>
          <textarea rows={2} {...field("decline_reason")} />
        </label>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {errorMessage(error).detail}
        </p>
      ) : null}
      {saved ? (
        <p className="field-help" role="status">
          Details updated.
        </p>
      ) : null}
      <button className="button primary" type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function Notes({ id, notes, done }: { id: string; notes: Note[]; done: () => void }) {
  const provider = useDataProvider<HoneymoonDataProvider>();
  const actor = currentActor();
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<Note>();
  const [editBody, setEditBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>();
  const mutate = async (operation: () => Promise<unknown>) => {
    setBusy(true);
    setError(undefined);
    try {
      await operation();
      setBody("");
      setEditing(undefined);
      done();
    } catch (cause) {
      setError(cause);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {notes.length ? (
        <ul className="timeline">
          {notes.map((note) => (
            <li key={note.id}>
              <div>
                <strong>{note.display_name}</strong>
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleDateString()}
                </time>
              </div>
              {editing?.id === note.id ? (
                <form
                  aria-label={`Edit note by ${note.display_name}`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void mutate(() => provider.updateNote(id, note.id, { body: editBody.trim() }));
                  }}
                >
                  <label>
                    <span className="sr-only">Note text</span>
                    <textarea
                      value={editBody}
                      onChange={(event) => setEditBody(event.target.value)}
                      required
                    />
                  </label>
                  <div className="button-row">
                    <button type="submit" className="button primary" disabled={busy}>
                      Save note
                    </button>
                    <button
                      className="button quiet"
                      type="button"
                      onClick={() => setEditing(undefined)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{note.body}</p>
                  {note.actor_id === actor.id ? (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => {
                        setEditing(note);
                        setEditBody(note.body);
                      }}
                    >
                      Edit note
                    </button>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No notes yet.</p>
      )}
      <form
        className="inline-form note-form"
        aria-label="Add note"
        onSubmit={(event) => {
          event.preventDefault();
          if (body.trim()) void mutate(() => provider.addNote(id, { body: body.trim() }));
        }}
      >
        <label>
          <span>Add a note</span>
          <textarea
            rows={3}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="field-error" role="alert">
            {errorMessage(error).detail}
          </p>
        ) : null}
        <button className="button secondary" type="submit" disabled={busy || !body.trim()}>
          {busy ? "Posting…" : "Post note"}
        </button>
      </form>
    </>
  );
}

function DetailContent({ detail, reload }: { detail: HoneymoonPeriodView; reload: () => void }) {
  const { item } = detail;
  const actor = currentActor();
  const ownPreference = detail.preferences.find((preference) => preference.actor_id === actor.id);
  const metadataEntries = Object.entries(item.metadata).filter(
    ([, value]) => value !== "" && value != null,
  );
  return (
    <div className="page-shell detail-page">
      <Link className="back-link" to="/honeymoon-periods">
        ← Back to ranked ideas
      </Link>
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            {item.kind} · {item.status}
          </p>
          <h1>{item.title}</h1>
          <a href={item.normalized_url} target="_blank" rel="noreferrer">
            Open normalized source ↗
          </a>
        </div>
        <div className="total-score">
          <span>Rank total</span>
          <strong>{item.rank.total}</strong>
        </div>
      </header>
      <div className="detail-grid">
        <section className="surface">
          <h2>Why it ranks</h2>
          <dl className="large-breakdown">
            <div>
              <dt>Scores</dt>
              <dd>{item.rank.score}</dd>
            </div>
            <div>
              <dt>Votes</dt>
              <dd>{item.rank.votes}</dd>
            </div>
            <div>
              <dt>Explicit boost</dt>
              <dd>{item.rank.boost}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{item.rank.total}</dd>
            </div>
          </dl>
          <p className="field-help">
            Total = average available score + vote weights + explicit boost.
          </p>
        </section>
        <section className="surface">
          <h2>Preferences</h2>
          {detail.preferences.length ? (
            <ul className="preference-list">
              {detail.preferences.map((preference) => (
                <li key={preference.actor_id}>
                  <strong>{preference.display_name}</strong>
                  <span>
                    {preference.vote ?? "No vote"} ·{" "}
                    {preference.score == null ? "No score" : `${preference.score}/5`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Neither participant has voted yet.</p>
          )}
          <h3>Your preference as {actor.name}</h3>
          <PreferenceForm
            key={`${actor.id}-${ownPreference?.updated_at ?? "new"}`}
            id={item.id}
            preference={ownPreference}
            done={reload}
          />
        </section>
        <section className="surface wide" aria-labelledby="preference-history-heading">
          <h2 id="preference-history-heading">Preference history</h2>
          {detail.history.items.length ? (
            <ol className="timeline" aria-label="Chronological preference history">
              {detail.history.items.map((historyEvent) => (
                <li key={historyEvent.id}>
                  <strong>{historyEvent.display_name}</strong>
                  <span>
                    {historyEvent.payload.changes.vote.before ?? "No vote"} →{" "}
                    {historyEvent.payload.changes.vote.after ?? "No vote"};{" "}
                    {historyEvent.payload.changes.score.before ?? "No score"} →{" "}
                    {historyEvent.payload.changes.score.after ?? "No score"}
                  </span>
                  {historyEvent.payload.reason ? <p>{historyEvent.payload.reason}</p> : null}
                  <time dateTime={historyEvent.accepted_at}>
                    Change {historyEvent.sequence} ·{" "}
                    {new Date(historyEvent.accepted_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No preference changes yet.</p>
          )}
        </section>
        <section className="surface wide">
          <h2>Details & metadata</h2>
          {metadataEntries.length ? (
            <dl className="metadata-list">
              {metadataEntries.map(([name, value]) => (
                <div key={name}>
                  <dt>{name.replaceAll("_", " ")}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="muted">No structured metadata yet.</p>
          )}
          {item.metadata_updated_by_actor_id ? (
            <p className="field-help">
              Last updated by {actorName(item.metadata_updated_by_actor_id)}.
            </p>
          ) : null}
          <details>
            <summary>Edit details</summary>
            <MetadataForm key={item.updated_at} item={item} done={reload} />
          </details>
        </section>
        <section className="surface">
          <h2>Notes</h2>
          <Notes id={item.id} notes={detail.notes} done={reload} />
        </section>
        <section className="surface">
          <h2>Source history</h2>
          {detail.captures.length ? (
            <ol className="timeline">
              {detail.captures.map((capture) => (
                <li key={capture.id}>
                  <a href={capture.source_url} target="_blank" rel="noreferrer">
                    {capture.source_url}
                  </a>
                  <div>
                    <span>{capture.enrichment_status}</span>
                    <time dateTime={capture.captured_at}>
                      {new Date(capture.captured_at).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="muted">No capture provenance available.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export function PeriodShow() {
  const { id = "" } = useParams();
  const { data, isPending, isFetching, error, refetch } = useGetOne<HoneymoonRecord>(
    "honeymoon-periods",
    { id },
  );
  if (isPending || (!data?.detail && isFetching))
    return (
      <div className="page-shell">
        <LoadingState label="Loading details…" />
      </div>
    );
  if (error || !data?.detail)
    return (
      <div className="page-shell">
        <ErrorState
          error={error ?? new Error("Details are unavailable.")}
          retry={() => void refetch()}
        />
      </div>
    );
  return <DetailContent detail={data.detail} reload={() => void refetch()} />;
}
