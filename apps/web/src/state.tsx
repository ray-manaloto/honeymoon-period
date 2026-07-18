import { ApiError } from "@honeymoon-period/generated";

export function errorMessage(error: unknown): { title: string; detail: string } {
  if (error instanceof ApiError && error.status === 401) {
    return {
      title: "You’re not authorized",
      detail: "Choose a valid local participant and try again.",
    };
  }
  if (
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network|offline/i.test(error.message))
  ) {
    return {
      title: "You appear to be offline",
      detail: "Check that the local API is running, then retry.",
    };
  }
  return {
    title: "We couldn’t load this",
    detail: error instanceof Error ? error.message : "Please try again.",
  };
}

export function LoadingState({ label = "Loading ideas…" }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
  const message = errorMessage(error);
  return (
    <div className="state-panel error-state" role="alert">
      <h2>{message.title}</h2>
      <p>{message.detail}</p>
      <button type="button" className="button secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
