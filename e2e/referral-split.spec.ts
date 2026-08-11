import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#referral-split");
const total = (page: Page, id: string) => demo(page).locator(`[data-total="${id}"]`);
const cents = async (page: Page, selector: string) => {
  const text = await demo(page).locator(selector).innerText();
  return Math.round(Number(text.replace(/[^\d.-]/g, "")) * 100);
};

async function setPool(page: Page, value: number) {
  await demo(page).locator("#referral-pool").fill(String(value));
}

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(demo(page).locator("[data-member]").first()).toBeVisible();
}

// Демо снято с показа: см. `src/widgets/demos/referral-split/index.ts`
test.describe.skip("referral split demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(demo(page).locator("[data-member]")).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(demo(page).locator("[data-member]")).toHaveCount(12);
  });

  // Ползунок можно возить сколько угодно: выплачено обязано равняться пулу
  for (const pool of [1, 4999, 123_457, 200_000]) {
    test(`pays out the whole pool at ${pool}`, async ({ page }) => {
      await openDemo(page);
      await setPool(page, pool);

      await expect(total(page, "paid")).toBeVisible();
      expect(await cents(page, '[data-total="paid"]')).toBe(pool);
      expect(await cents(page, "[data-pool]")).toBe(pool);
    });
  }

  test("shows the row-by-row rounding failing to hit the pool", async ({ page }) => {
    await openDemo(page);
    await setPool(page, 100);

    await expect(total(page, "drift")).toHaveText("+1");
  });

  test("keeps every branch equal to what is under it", async ({ page }) => {
    await openDemo(page);
    await setPool(page, 88_888);

    const branch = await cents(page, '[data-branch="0x93c2"]');
    const own = await cents(page, '[data-payout="0x93c2"]');
    const children = await Promise.all(
      ["0x1d08", "0xb672", "0x5e19"].map((id) => cents(page, `[data-payout="${id}"]`)),
    );

    expect(branch).toBe(own + children.reduce((sum, value) => sum + value, 0));
  });
});
