import { type APIRequestContext, expect, type Page, test } from "@playwright/test";

const apiBase = "http://127.0.0.1:8788/v1";
const actorA = { authorization: "Bearer prototype-participant-a" };

async function capture(request: APIRequestContext, host: string, requestId: string) {
  const response = await request.post(`${apiBase}/captures`, {
    headers: actorA,
    data: { source_url: `https://${host}/place?utm_source=e2e`, client_request_id: requestId },
  });
  expect(response.ok()).toBe(true);
  return response.json() as Promise<{ honeymoon_period: { id: string; title: string } }>;
}

async function openDetail(page: Page, id: string) {
  await page.goto(`/#/honeymoon-periods/${id}/show`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("1. captures a valid link and shows it in the ranked list", async ({ page }) => {
  await page.goto("/#/capture");
  await page
    .getByLabel("Source link")
    .fill("https://capture-fixture.example.com/place?utm_source=messages");
  await page.getByRole("button", { name: "Save link" }).click();
  await expect(page.getByRole("status")).toContainText("Link saved");
  await page.getByRole("link", { name: "Ranked ideas" }).click();
  await expect(page.getByRole("link", { name: "capture-fixture.example.com" })).toBeVisible();
});

test("2. replays one client request without duplicating its honeymoon-period", async ({ page }) => {
  await page.goto("/#/honeymoon-periods");
  const result = await page.evaluate(async () => {
    const input = {
      source_url: "https://replay-fixture.example.com/place",
      client_request_id: "e2e-replay",
    };
    const send = () =>
      fetch("/v1/captures", {
        method: "POST",
        headers: {
          authorization: "Bearer prototype-participant-a",
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
      }).then(async (response) => ({ status: response.status, body: await response.json() }));
    return [await send(), await send()];
  });
  expect(result.map(({ status }) => status)).toEqual([201, 200]);
  await page.reload();
  await expect(page.getByRole("link", { name: "replay-fixture.example.com" })).toHaveCount(1);
});

test("3. records each participant preference without overwriting ownership", async ({
  page,
  request,
}) => {
  const { honeymoon_period: item } = await capture(
    request,
    "preference-fixture.example.com",
    "e2e-preferences",
  );
  await openDetail(page, item.id);
  await page.getByLabel("Vote").selectOption("interested");
  await page.getByLabel("Score (0–5, optional)").fill("5");
  await page.getByLabel("Reason (optional)").fill("Great first choice");
  await page.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText("interested · 5/5", { exact: false })).toBeVisible();
  const history = page.getByRole("list", { name: "Chronological preference history" });
  await expect(history).toContainText("Great first choice");
  await expect(history.getByRole("listitem")).toHaveCount(1);
  await page.getByLabel("Acting as participant").selectOption("prototype-participant-b");
  await page.getByLabel("Vote").selectOption("maybe");
  await page.getByLabel("Score (0–5, optional)").fill("3");
  await page.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText("interested · 5/5", { exact: false })).toBeVisible();
  await expect(page.getByText("maybe · 3/5", { exact: false })).toBeVisible();
  await expect(history.getByRole("listitem")).toHaveCount(2);
});

test("4. edits notes and structured metadata", async ({ page, request }) => {
  const { honeymoon_period: item } = await capture(
    request,
    "details-fixture.example.com",
    "e2e-details",
  );
  await openDetail(page, item.id);
  await page.getByLabel("Add a note").fill("Synthetic first note");
  await page.getByRole("button", { name: "Post note" }).click();
  await expect(page.getByText("Synthetic first note")).toBeVisible();
  await page.getByRole("button", { name: "Edit note" }).click();
  await page.getByLabel("Note text").fill("Synthetic edited note");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Synthetic edited note")).toBeVisible();
  await page.getByText("Edit details").click();
  await page.getByLabel("Title").fill("Details Fixture");
  await page.getByLabel("Cuisine").fill("Fixture cuisine");
  await page.getByLabel("Special", { exact: true }).fill("Synthetic happy hour");
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(page.getByRole("heading", { name: "Details Fixture" })).toBeVisible();
  await expect(page.getByText("Fixture cuisine")).toBeVisible();
});

test("5. filters and sorts while retaining visible rank explanations", async ({ page }) => {
  await page.goto("/#/honeymoon-periods");
  await page.getByLabel("Search").fill("Fixture");
  await page.getByLabel("Kind").selectOption("restaurant");
  await page.getByLabel("Sort by").selectOption("title");
  await page.getByRole("button", { name: "Sort ascending" }).click();
  const card = page.getByRole("listitem").filter({ hasText: "Fixture Bistro" });
  await expect(card).toBeVisible();
  await expect(card.getByLabel("Rank explanation for Fixture Bistro")).toContainText("Total");
});

test("6. renders empty, invalid-link, unauthorized, and network-retry states", async ({ page }) => {
  await page.goto("/#/honeymoon-periods");
  await page.getByLabel("Status").selectOption("completed");
  await expect(
    page.getByRole("heading", { name: "No ideas match these filters yet." }),
  ).toBeVisible();
  await page.goto("/#/capture");
  await page.getByLabel("Source link").fill("file:///private/fixture");
  await page.getByRole("button", { name: "Save link" }).click();
  await expect(page.getByRole("alert")).toContainText("valid http or https");
  await page.evaluate(() =>
    localStorage.setItem("honeymoon-period.fixture-actor-token", "invalid-fixture-token"),
  );
  await page.goto("/#/honeymoon-periods");
  await expect(page.getByRole("alert")).toContainText("not authorized");
  await page.evaluate(() =>
    localStorage.setItem("honeymoon-period.fixture-actor-token", "prototype-participant-a"),
  );
  await page.route("**/v1/honeymoon-periods*", (route) => route.abort("internetdisconnected"));
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("offline", { timeout: 15_000 });
  await page.unroute("**/v1/honeymoon-periods*");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("list", { name: "Ranked honeymoon-periods" })).toBeVisible();
});

test("7. supports the primary phone viewport and keyboard-only capture", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/capture");
  const source = page.getByLabel("Source link");
  await source.focus();
  await source.fill("https://keyboard-fixture.example.com/place");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save link" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Link saved");
  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ clientWidth: 390, scrollWidth: 390 });

  await page.goto("/#/honeymoon-periods");
  await expect(page.getByRole("list", { name: "Ranked honeymoon-periods" })).toBeVisible();
  const firstIdea = page.getByRole("listitem").filter({ hasText: "Fixture Bistro" });
  await expect(firstIdea.getByLabel("Rank explanation for Fixture Bistro")).toContainText("Total");
  await firstIdea.getByRole("link", { name: "Fixture Bistro" }).click();
  await expect(page.getByRole("heading", { name: "Fixture Bistro" })).toBeVisible();
  const preferenceForm = page.getByRole("form", { name: "Your preference" });
  await expect(preferenceForm).toBeVisible();
  await preferenceForm.getByLabel("Vote").selectOption("interested");
  await preferenceForm.getByLabel("Score (0–5, optional)").fill("4");
  await preferenceForm.getByRole("button", { name: "Save preference" }).click();
  await expect(page.getByText("interested · 4/5", { exact: false })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ clientWidth: 390, scrollWidth: 390 });
});

test("8. reloads with persisted server state and no client-only source of truth", async ({
  page,
  request,
}) => {
  await capture(request, "persistence-fixture.example.com", "e2e-persistence");
  await page.goto("/#/honeymoon-periods");
  await expect(page.getByRole("link", { name: "persistence-fixture.example.com" })).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("link", { name: "persistence-fixture.example.com" })).toBeVisible();
});
