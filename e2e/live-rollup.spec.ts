import { test, expect, type Page } from "@playwright/test";

const WAIT = { timeout: 15_000 };

const chart = (page: Page) => page.getByRole("img", { name: /Two ways of counting/ });
const meter = (page: Page, id: string) => page.locator(`[data-meter="${id}"]`);

const press = (page: Page, name: string) =>
  page.locator("#live-rollup").getByRole("button", { name, exact: true }).click();

/** Проценты и разряды у чисел приходят отформатированными под локаль. */
const read = (page: Page, id: string) => async () =>
  Number((await meter(page, id).innerText()).replace(/[^\d.]/g, ""));

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await page.locator("#live-rollup").scrollIntoViewIfNeeded();
  await expect(chart(page)).toBeVisible();
}

test.describe("live roll-up demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(chart(page)).toHaveCount(0);

    await page.locator("#live-rollup").scrollIntoViewIfNeeded();
    await expect(chart(page)).toBeVisible();
  });

  // Весь тезис демо одной проверкой: сумму свёртка переживает, перцентиль — нет
  test("keeps sum identical and lets p95 drift", async ({ page }) => {
    await openDemo(page);

    await press(page, "sum");
    await expect(page.locator("[data-verdict]")).toHaveAttribute("data-verdict", "identical");
    await expect.poll(read(page, "drift"), WAIT).toBe(0);

    await press(page, "p95");
    await expect(page.locator("[data-verdict]")).toHaveAttribute("data-verdict", "drift", WAIT);
    await expect.poll(read(page, "drift"), WAIT).toBeGreaterThan(1);
  });

  test("calls a zero over a hole a full miss", async ({ page }) => {
    await openDemo(page);

    await press(page, "sum");
    await expect.poll(read(page, "worst"), WAIT).toBe(0);

    await press(page, "Gap in the stream");
    await expect.poll(read(page, "worst"), WAIT).toBe(100);
  });

  test("stops the stream on pause", async ({ page }) => {
    await openDemo(page);
    await expect.poll(read(page, "events"), WAIT).toBeGreaterThan(0);

    await press(page, "Pause");
    await expect.poll(read(page, "events"), WAIT).toBe(0);
  });
});
