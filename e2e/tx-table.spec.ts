import { test, expect, type Page } from "@playwright/test";

const rows = (page: Page) => page.locator("[data-tx-row]");
const meter = (page: Page, label: string) => page.locator(`[data-meter="${label}"]`);
const repaints = (page: Page) => meter(page, "Row repaints per second");

const press = (page: Page, name: string) =>
  page.locator("#tx-table").getByRole("button", { name, exact: true }).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await page.locator("#tx-table").scrollIntoViewIfNeeded();
  await expect(rows(page).first()).toBeVisible();
}

const settle = async (page: Page) => page.waitForTimeout(1200);

test.describe("transaction table demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(rows(page)).toHaveCount(0);

    await page.locator("#tx-table").scrollIntoViewIfNeeded();
    await expect(rows(page).first()).toBeVisible();
  });

  test("keeps a window of rows in the DOM, not the whole ledger", async ({ page }) => {
    await openDemo(page);

    const windowed = await rows(page).count();
    expect(windowed).toBeGreaterThan(0);
    expect(windowed).toBeLessThan(60);
    await expect(meter(page, "Rows actually drawn")).toContainText("500");

    await press(page, "Virtualised");
    await expect(rows(page)).toHaveCount(500);
  });

  // Смысл мемоизации здесь не в скорости, а в объёме работы: она видна как
  // разница между «перерисовали строку» и «перерисовали сетку»
  test("repaints one row with memo on, and the whole window with it off", async ({ page }) => {
    await openDemo(page);
    await settle(page);
    const memoised = Number(await repaints(page).innerText());

    await press(page, "Row memo");
    await settle(page);
    const plain = Number(await repaints(page).innerText());

    expect(plain).toBeGreaterThan(memoised * 5);
    expect(plain).toBeGreaterThan(50);
  });

  test("streams status changes until it is paused", async ({ page }) => {
    await openDemo(page);

    const statuses = () => page.locator("[data-tx-row] [data-tx-status]").allInnerTexts();
    const before = await statuses();
    await expect.poll(statuses).not.toEqual(before);

    await press(page, "Pause");
    await settle(page);
    const paused = await statuses();
    await settle(page);
    expect(await statuses()).toEqual(paused);
  });

  test("moves the window when the list is scrolled", async ({ page }) => {
    await openDemo(page);
    const first = await rows(page).first().getAttribute("data-tx-row");

    await page
      .getByRole("region", { name: "Transactions" })
      .evaluate((node) => node.scrollTo({ top: 4000 }));

    await expect
      .poll(async () => rows(page).first().getAttribute("data-tx-row"))
      .not.toBe(first);
    await expect(rows(page)).not.toHaveCount(500);
  });
});
