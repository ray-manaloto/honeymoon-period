import { ApiError } from "@honeymoon-period/generated";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorState, errorMessage, LoadingState } from "../src/state";

describe("application states", () => {
  it("classifies authorization, offline, generic, and unknown failures", () => {
    expect(
      errorMessage(
        new ApiError(401, { error: { code: "unauthorized", message: "fixture unauthorized" } }),
      ).title,
    ).toContain("not authorized");
    expect(errorMessage(new TypeError("Failed to fetch")).title).toContain("offline");
    expect(errorMessage(new Error("Network disconnected")).title).toContain("offline");
    expect(errorMessage(new Error("Synthetic failure")).detail).toBe("Synthetic failure");
    expect(errorMessage("unknown").detail).toBe("Please try again.");
  });

  it("renders custom loading text and invokes retry", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const { rerender } = render(<LoadingState label="Loading fixture…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading fixture…");
    rerender(<ErrorState error={new Error("Try fixture")} retry={retry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
