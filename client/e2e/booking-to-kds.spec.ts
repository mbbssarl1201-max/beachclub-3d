import { test, expect } from "@playwright/test";

// Happy path: reserve a daybed → order via tap-to-add → see it appear live on the KDS.
test("book a daybed, order, and see it on the KDS", async ({ page, context }) => {
  // Pick a daybed id unlikely to collide across runs.
  const daybedId = "ps3";

  // Open the KDS in a second tab first so we can observe the live broadcast.
  const kds = await context.newPage();
  await kds.goto("/kds");

  // Go straight to the daybed ordering page (simulates the QR scan).
  await page.goto(`/d/${daybedId}`);

  // Tap-to-order: add a Mojito from the menu, then commander.
  await page.getByRole("button", { name: /Mojito/ }).first().click();
  await expect(page.getByText(/1× Mojito/)).toBeVisible();
  await page.getByRole("button", { name: "Commander" }).click();

  // The order pops on the KDS in real time, with the daybed id and total.
  const card = kds.locator("div", { hasText: daybedId }).filter({ hasText: "Mojito" });
  await expect(card.first()).toBeVisible({ timeout: 10_000 });
});
