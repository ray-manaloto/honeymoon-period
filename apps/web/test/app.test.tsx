import type { HistoryPage, HoneymoonPeriodDetail } from "@honeymoon-period/generated";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { memoryStore } from "react-admin";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import type { HoneymoonDataProvider } from "../src/data-provider";

const item = {
  id: "period-1",
  title: "Fixture Bistro",
  kind: "restaurant",
  status: "active" as const,
  normalized_url: "https://example.com/bistro",
  metadata: { cuisine: "Fixture cuisine", address: "123 Example Street" },
  metadata_updated_by_actor_id: null,
  rank_boost: 1,
  rank: { score: 4, votes: 3, boost: 1, total: 8 },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};
const detail: HoneymoonPeriodDetail & { history: HistoryPage } = {
  item,
  captures: [
    {
      id: "capture-1",
      honeymoon_period_id: item.id,
      actor_id: "actor-a",
      source_url: "https://source.example/bistro",
      client_request_id: "request-1",
      enrichment_status: "pending",
      captured_at: item.created_at,
    },
  ],
  preferences: [
    {
      actor_id: "actor-a",
      honeymoon_period_id: item.id,
      display_name: "Participant A",
      vote: "interested",
      score: 5,
      updated_at: item.updated_at,
    },
  ],
  notes: [
    {
      id: "note-1",
      actor_id: "actor-a",
      honeymoon_period_id: item.id,
      display_name: "Participant A",
      body: "Try the patio",
      created_at: item.created_at,
    },
  ],
  history: {
    items: [
      {
        sequence: 1,
        id: "00000000-0000-4000-8000-000000000301",
        type: "PreferenceChanged",
        honeymoon_period_id: item.id,
        actor_id: "actor-a",
        display_name: "Participant A",
        accepted_at: item.updated_at,
        payload: {
          reason: "Great patio",
          changes: {
            vote: { before: null, after: "interested" },
            score: { before: null, after: 5 },
          },
        },
      },
    ],
  },
};

function provider(overrides: Partial<HoneymoonDataProvider> = {}): HoneymoonDataProvider {
  return {
    getList: vi.fn().mockResolvedValue({ data: [item], total: 1 }),
    getOne: vi.fn().mockResolvedValue({ data: { ...item, detail } }),
    getMany: vi.fn().mockResolvedValue({ data: [item] }),
    getManyReference: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({ data: item }),
    update: vi.fn().mockResolvedValue({ data: item }),
    updateMany: vi.fn().mockResolvedValue({ data: [] }),
    delete: vi.fn().mockResolvedValue({ data: item }),
    deleteMany: vi.fn().mockResolvedValue({ data: [] }),
    createPreferenceChange: vi.fn().mockResolvedValue({
      data: { status: "changed", event: detail.history.items[0] },
    }),
    addNote: vi.fn().mockResolvedValue({ data: detail.notes[0] }),
    updateNote: vi.fn().mockResolvedValue({ data: detail.notes[0] }),
    ...overrides,
  };
}

afterEach(() => localStorage.clear());

describe("web MVP", () => {
  it("renders ranked filters with accessible controls and opens full detail", async () => {
    const user = userEvent.setup();
    render(
      <App dataProvider={provider()} store={memoryStore()} initialPath="/honeymoon-periods" />,
    );
    expect(await screen.findByRole("heading", { name: "Ranked ideas" })).toBeVisible();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(await screen.findByRole("link", { name: /Fixture Bistro/ })).toBeVisible();
    const rank = screen.getByLabelText("Rank explanation for Fixture Bistro");
    expect(within(rank).getByText("Total")).toBeVisible();
    expect(within(rank).getByText("8")).toBeVisible();
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "Fixture");
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "planned");
    await user.selectOptions(screen.getByRole("combobox", { name: "Kind" }), "restaurant");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "title");
    await user.click(screen.getByRole("button", { name: "Sort ascending" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Acting as participant" }),
      "local-participant-b",
    );
    await user.click(screen.getByRole("link", { name: /Fixture Bistro/ }));
    expect(await screen.findByRole("heading", { name: "Fixture Bistro" })).toBeVisible();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Why it ranks" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Source history" })).toBeVisible();
    expect(screen.getByText("Try the patio")).toBeVisible();
    expect(screen.getByText("Fixture cuisine")).toBeVisible();
  });

  it("creates a capture and provides validation feedback", async () => {
    const user = userEvent.setup();
    const create = vi.fn().mockResolvedValue({ data: item });
    render(
      <App dataProvider={provider({ create })} store={memoryStore()} initialPath="/capture" />,
    );
    await user.click(await screen.findByRole("button", { name: "Save link" }));
    expect(await screen.findByText("Enter a valid http or https link.")).toBeVisible();
    await user.type(
      screen.getByRole("textbox", { name: "Source link" }),
      "https://example.com/bistro",
    );
    await user.click(screen.getByRole("button", { name: "Save link" }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(await screen.findByText("Link saved to your ranked ideas.")).toBeVisible();
  });

  it("keeps showing a loading state while a captured idea fetches its full detail", async () => {
    const user = userEvent.setup();
    let resolveDetail: (value: { data: typeof item & { detail: HoneymoonPeriodDetail } }) => void =
      () => undefined;
    const pendingDetail = new Promise<{ data: typeof item & { detail: HoneymoonPeriodDetail } }>(
      (resolve) => {
        resolveDetail = resolve;
      },
    );
    render(
      <App
        dataProvider={provider({
          create: vi.fn().mockResolvedValue({ data: item }),
          getOne: vi.fn().mockReturnValue(pendingDetail),
        })}
        store={memoryStore()}
        initialPath="/capture"
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Source link" }),
      "https://example.com/bistro",
    );
    await user.click(screen.getByRole("button", { name: "Save link" }));
    await user.click(await screen.findByRole("link", { name: "Review details" }));

    expect(await screen.findByText("Loading details…")).toBeVisible();
    expect(screen.queryByText("Details are unavailable.")).not.toBeInTheDocument();

    resolveDetail({ data: { ...item, detail } });
    expect(await screen.findByRole("heading", { name: "Fixture Bistro" })).toBeVisible();
  });

  it("shows metadata update provenance for an actor outside the local fixture roster", async () => {
    const provenanceDetail: HoneymoonPeriodDetail = {
      ...detail,
      item: { ...item, metadata_updated_by_actor_id: "external-actor" },
    };
    render(
      <App
        dataProvider={provider({
          getOne: vi
            .fn()
            .mockResolvedValue({ data: { ...provenanceDetail.item, detail: provenanceDetail } }),
        })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    expect(await screen.findByText("Last updated by external-actor.")).toBeVisible();
  });

  it("shows client and server capture errors and allows dismissing the server error", async () => {
    const user = userEvent.setup();
    const create = vi.fn().mockRejectedValue(new Error("Synthetic server rejection"));
    render(
      <App dataProvider={provider({ create })} store={memoryStore()} initialPath="/capture" />,
    );
    await user.type(screen.getByRole("textbox", { name: "Source link" }), "file:///private/test");
    await user.click(screen.getByRole("button", { name: "Save link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("valid http or https");
    await user.clear(screen.getByRole("textbox", { name: "Source link" }));
    await user.type(
      screen.getByRole("textbox", { name: "Source link" }),
      "https://example.com/fail",
    );
    await user.click(screen.getByRole("button", { name: "Save link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic server rejection");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Synthetic server rejection")).not.toBeInTheDocument();
  });

  it("writes an actor-owned preference and note through custom provider methods", async () => {
    const user = userEvent.setup();
    const createPreferenceChange = vi.fn().mockResolvedValue({
      data: { status: "changed", event: detail.history.items[0] },
    });
    const addNote = vi.fn().mockResolvedValue({ data: detail.notes[0] });
    render(
      <App
        dataProvider={provider({ createPreferenceChange, addNote })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    await screen.findByRole("heading", { name: "Fixture Bistro" });
    const form = screen.getByRole("form", { name: "Your preference" });
    await user.selectOptions(within(form).getByRole("combobox", { name: "Vote" }), "maybe");
    await user.clear(within(form).getByRole("spinbutton", { name: "Score (0–5, optional)" }));
    await user.type(within(form).getByRole("spinbutton", { name: "Score (0–5, optional)" }), "4");
    await user.type(within(form).getByRole("textbox", { name: "Reason (optional)" }), "Worth it");
    fireEvent.submit(form);
    await waitFor(() =>
      expect(createPreferenceChange).toHaveBeenCalledWith(item.id, {
        vote: "maybe",
        score: 4,
        reason: "Worth it",
        client_request_id: expect.any(String),
      }),
    );
    expect(
      screen.getByRole("list", { name: "Chronological preference history" }),
    ).toHaveTextContent("Great patio");
    await user.type(screen.getByRole("textbox", { name: "Add a note" }), "Reserve outside");
    await user.click(screen.getByRole("button", { name: "Post note" }));
    await waitFor(() => expect(addNote).toHaveBeenCalledWith(item.id, { body: "Reserve outside" }));
  });

  it("submits a preference without an optional reason and explains empty history", async () => {
    const user = userEvent.setup();
    const emptyDetail = { ...detail, history: { items: [] } };
    const createPreferenceChange = vi.fn().mockResolvedValue({
      data: { status: "unchanged", event: null },
    });
    render(
      <App
        dataProvider={provider({
          getOne: vi.fn().mockResolvedValue({ data: { ...item, detail: emptyDetail } }),
          createPreferenceChange,
        })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    expect(await screen.findByText("No preference changes yet.")).toBeVisible();
    const form = screen.getByRole("form", { name: "Your preference" });
    await user.selectOptions(within(form).getByRole("combobox", { name: "Vote" }), "maybe");
    await user.click(within(form).getByRole("button", { name: "Save preference" }));
    await waitFor(() =>
      expect(createPreferenceChange).toHaveBeenCalledWith(item.id, {
        vote: "maybe",
        score: 5,
        client_request_id: expect.any(String),
      }),
    );
  });

  it("validates preference score and reports preference and note mutation failures", async () => {
    const user = userEvent.setup();
    const failure = new Error("Synthetic mutation failure");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const createPreferenceChange = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValue({ data: { status: "unchanged", event: null } });
    render(
      <App
        dataProvider={provider({
          createPreferenceChange,
          addNote: vi.fn().mockRejectedValue(failure),
        })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    await screen.findByRole("heading", { name: "Fixture Bistro" });
    const form = screen.getByRole("form", { name: "Your preference" });
    const score = within(form).getByRole("spinbutton", { name: "Score (0–5, optional)" });
    await user.clear(score);
    await user.type(score, "6");
    fireEvent.submit(form);
    expect(await within(form).findByRole("alert")).toHaveTextContent("whole number");
    await user.clear(score);
    await user.type(score, "2");
    await user.click(within(form).getByRole("button", { name: "Save preference" }));
    expect(await within(form).findByRole("alert")).toHaveTextContent("Synthetic mutation failure");
    await user.click(within(form).getByRole("button", { name: "Save preference" }));
    await waitFor(() => expect(createPreferenceChange).toHaveBeenCalledTimes(2));
    expect(createPreferenceChange.mock.calls[1]?.[1].client_request_id).toBe(
      createPreferenceChange.mock.calls[0]?.[1].client_request_id,
    );
    await user.type(screen.getByRole("textbox", { name: "Add a note" }), "A failing note");
    await user.click(screen.getByRole("button", { name: "Post note" }));
    const noteForm = screen.getByRole("form", { name: "Add note" });
    expect(await within(noteForm).findByRole("alert")).toHaveTextContent(
      "Synthetic mutation failure",
    );
    consoleError.mockRestore();
  });

  it("edits structured details and only the selected actor's note", async () => {
    const user = userEvent.setup();
    const update = vi.fn().mockResolvedValue({ data: item });
    const updateNote = vi.fn().mockResolvedValue({ data: detail.notes[0] });
    render(
      <App
        dataProvider={provider({ update, updateNote })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    await screen.findByRole("heading", { name: "Fixture Bistro" });
    await user.click(screen.getByText("Edit details"));
    const detailsForm = screen.getByRole("form", { name: "Edit details" });
    await user.clear(within(detailsForm).getByRole("textbox", { name: "Cuisine" }));
    await user.type(within(detailsForm).getByRole("textbox", { name: "Cuisine" }), "Italian");
    await user.click(within(detailsForm).getByRole("button", { name: "Save details" }));
    await waitFor(() => expect(update).toHaveBeenCalled());
    expect(update.mock.calls[0]?.[1].data.metadata.cuisine).toBe("Italian");
    expect(update.mock.calls[0]?.[1].data.metadata.special_date).toBeUndefined();

    await user.click(screen.getByRole("button", { name: "Edit note" }));
    const noteForm = screen.getByRole("form", { name: "Edit note by Participant A" });
    await user.clear(within(noteForm).getByRole("textbox", { name: "Note text" }));
    await user.type(within(noteForm).getByRole("textbox", { name: "Note text" }), "Book the patio");
    await user.click(within(noteForm).getByRole("button", { name: "Save note" }));
    await waitFor(() =>
      expect(updateNote).toHaveBeenCalledWith(item.id, "note-1", { body: "Book the patio" }),
    );
  });

  it("shows empty, offline, unauthorized, and retry states", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const retrying = provider({
      getList: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    });
    const { unmount } = render(
      <App dataProvider={retrying} store={memoryStore()} initialPath="/honeymoon-periods" />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("offline");
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
    unmount();
    render(
      <App
        dataProvider={provider({ getList: vi.fn().mockResolvedValue({ data: [], total: 0 }) })}
        store={memoryStore()}
        initialPath="/honeymoon-periods"
      />,
    );
    expect(await screen.findByText("No ideas match these filters yet.")).toBeVisible();
    consoleError.mockRestore();
  });

  it("renders a retryable detail error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <App
        dataProvider={provider({ getOne: vi.fn().mockResolvedValue({ data: item }) })}
        store={memoryStore()}
        initialPath="/honeymoon-periods/period-1/show"
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Details are unavailable");
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
    consoleError.mockRestore();
  });
});
