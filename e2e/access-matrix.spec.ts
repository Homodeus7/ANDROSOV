import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#access-matrix");
const row = (page: Page, id: string) => demo(page).locator(`[data-ticket="${id}"]`);
const count = (page: Page, id: string) => demo(page).locator(`[data-count="${id}"]`);

const action = (page: Page, ticket: string, name: string) =>
  demo(page)
    .locator("li")
    .filter({ has: page.locator(`[data-ticket="${ticket}"]`) })
    .locator(`[data-action="${name}"]`);

const pick = (page: Page, role: string) => demo(page).locator(`[data-role="${role}"]`).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(row(page, "TCK-1041")).toBeVisible();
}

test.describe("access matrix demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(row(page, "TCK-1041")).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(row(page, "TCK-1041")).toBeVisible();
  });

  test("hides a neighbour's flat from a resident", async ({ page }) => {
    await openDemo(page);
    await pick(page, "resident");

    await expect(count(page, "visible")).toHaveText("3/8");
    await expect(row(page, "TCK-1041")).toHaveAttribute("data-readable", "true");
    await expect(row(page, "TCK-1044")).toHaveAttribute("data-readable", "false");
  });

  // Одно и то же действие у одной роли: разрешено на своей строке и запрещено на чужой
  test("answers the same action differently row by row", async ({ page }) => {
    await openDemo(page);
    await pick(page, "dispatcher");

    await expect(action(page, "TCK-1041", "close")).toHaveAttribute("data-allowed", "true");
    await expect(action(page, "TCK-1042", "close")).toHaveAttribute("data-allowed", "false");
  });

  test("names the rule that decided", async ({ page }) => {
    await openDemo(page);
    await pick(page, "dispatcher");
    await action(page, "TCK-1041", "close").click();

    await expect(demo(page).locator("[data-verdict]")).toHaveAttribute(
      "data-verdict",
      "allowed",
    );
    await expect(demo(page).locator("[data-rule]")).toHaveAttribute(
      "data-rule",
      "dispatcher.close",
    );
  });

  test("has no rule to name when the answer is no", async ({ page }) => {
    await openDemo(page);
    await pick(page, "resident");
    await action(page, "TCK-1044", "close").click();

    await expect(demo(page).locator("[data-verdict]")).toHaveAttribute("data-verdict", "denied");
    await expect(demo(page).locator("[data-rule]")).toHaveAttribute("data-rule", "none");
  });

  test("shows the role check letting a resident into someone else's flat", async ({ page }) => {
    await openDemo(page);
    await pick(page, "resident");
    await expect(count(page, "diverges")).toHaveText("12");

    await demo(page).locator('[data-source="naive"]').click();

    await expect(count(page, "visible")).toHaveText("8/8");
    await expect(row(page, "TCK-1044")).toHaveAttribute("data-readable", "true");
    await expect(action(page, "TCK-1044", "close")).toHaveAttribute("data-allowed", "true");
  });
});
