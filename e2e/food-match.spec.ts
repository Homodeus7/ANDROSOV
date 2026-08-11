import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#food-match");
const kcal = (page: Page, column: "naive" | "ranked") =>
  demo(page).locator(`[data-kcal="${column}"]`);
const chosen = (page: Page) => demo(page).locator("[data-chosen]");

const press = (page: Page, name: string | RegExp) =>
  demo(page).getByRole("button", { name }).first().click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(kcal(page, "naive")).toBeVisible();
}

test.describe("food match demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(kcal(page, "naive")).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(kcal(page, "naive")).toBeVisible();
  });

  // Оба имени безупречны, и расходятся они втрое
  test("disagrees with the obvious rule about buckwheat", async ({ page }) => {
    await openDemo(page);

    await expect(kcal(page, "naive")).toHaveText("343");
    await expect(kcal(page, "ranked")).toHaveText("118");
    await expect(demo(page).locator("[data-verdict]")).toHaveAttribute(
      "data-verdict",
      "diverge",
    );
    await expect(demo(page).locator("[data-diverging]")).toBeVisible();
  });

  test("agrees about an apple until the flag is set wrongly", async ({ page }) => {
    await openDemo(page);
    await press(page, /^apple$/i);

    await expect(demo(page).locator("[data-verdict]")).toHaveAttribute("data-verdict", "agree");

    await press(page, "this food is eaten cooked");
    await expect(kcal(page, "ranked")).toHaveText("243");
  });

  // «dry grated» — тёртый пармезан; целым сегментом маркер не читается
  test("only calls grated parmesan dry when the name is read as a substring", async ({
    page,
  }) => {
    await openDemo(page);
    await press(page, /^parmesan$/i);
    await press(page, "this food is eaten cooked");

    const whole = await chosen(page).nth(1).innerText();
    expect(whole).toContain("dry grated");

    await press(page, "read the name as a substring");
    await expect(chosen(page).nth(1)).not.toContainText("dry grated");
  });

  test("shows which rows a rule filtered out", async ({ page }) => {
    await openDemo(page);
    await expect(demo(page).locator("[data-dropped]")).toHaveCount(0);

    await demo(page).locator('[data-rule="dataset"]').click();
    await expect(demo(page).locator("[data-dropped]")).toHaveCount(4);
  });
});
