import { useState } from "react";
import { useCreate } from "react-admin";
import { Link } from "react-router-dom";
import type { HoneymoonRecord } from "./data-provider";
import { errorMessage } from "./state";

function validSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function CapturePage() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [validation, setValidation] = useState("");
  const [error, setError] = useState<unknown>();
  const [saved, setSaved] = useState<HoneymoonRecord>();
  const [create, { isPending }] = useCreate();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(undefined);
    setError(undefined);
    const trimmed = sourceUrl.trim();
    if (!validSourceUrl(trimmed)) {
      setValidation("Enter a valid http or https link.");
      return;
    }
    setValidation("");
    create(
      "honeymoon-periods",
      { data: { source_url: trimmed, client_request_id: crypto.randomUUID() } },
      {
        onSuccess: (record) => {
          setSaved(record as HoneymoonRecord);
          setSourceUrl("");
        },
        onError: setError,
      },
    );
  };
  const failure = error ? errorMessage(error) : undefined;
  return (
    <div className="page-shell narrow-page">
      <header className="page-heading capture-heading">
        <div>
          <p className="eyebrow">Quick capture</p>
          <h1>Save a link</h1>
          <p>Paste the original source. Saving stays fast while enrichment happens later.</p>
        </div>
      </header>
      <form className="surface capture-form" onSubmit={submit} noValidate>
        <label htmlFor="source-url">Source link</label>
        <div className="capture-row">
          <input
            id="source-url"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            aria-describedby={validation ? "source-error" : "source-help"}
            aria-invalid={Boolean(validation)}
            placeholder="https://example.com/place"
          />
          <button className="button primary" type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save link"}
          </button>
        </div>
        {validation ? (
          <p id="source-error" className="field-error" role="alert">
            {validation}
          </p>
        ) : (
          <p id="source-help" className="field-help">
            The exact link and its source history will be preserved.
          </p>
        )}
      </form>
      {saved ? (
        <div className="state-panel success-state" role="status">
          <h2>Link saved to your ranked ideas.</h2>
          <p>{saved.title}</p>
          <Link className="button secondary" to={`/honeymoon-periods/${saved.id}/show`}>
            Review details
          </Link>
        </div>
      ) : null}
      {failure ? (
        <div className="state-panel error-state" role="alert">
          <h2>{failure.title}</h2>
          <p>{failure.detail}</p>
          <button type="button" className="button secondary" onClick={() => setError(undefined)}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  );
}
