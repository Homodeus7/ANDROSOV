import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#wallet-state");
const status = (page: Page) => demo(page).locator("[data-status]");
const advice = (page: Page) => demo(page).locator("[data-advice]");
const raw = (page: Page) => demo(page).locator("[data-code]");

const press = (page: Page, event: string) =>
  demo(page).locator(`[data-event="${event}"]:not([disabled])`).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(status(page)).toHaveAttribute("data-status", "disconnected");
}

const connect = async (page: Page) => {
  await press(page, "connect");
  await press(page, "approve");
};

test.describe("wallet state demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(status(page)).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(status(page)).toBeVisible();
  });

  test("keeps a request open until the wallet answers", async ({ page }) => {
    await openDemo(page);
    await press(page, "connect");

    await expect(status(page)).toHaveAttribute("data-status", "connecting");
    await expect(demo(page).locator('[data-event="connect"]')).toBeDisabled();
  });

  // Отказ на подписи не стоит подключения — ради этого перехода демо и написано
  test("costs nothing when a signature is refused", async ({ page }) => {
    await openDemo(page);
    await connect(page);
    await press(page, "sign");
    await press(page, "reject");

    await expect(status(page)).toHaveAttribute("data-status", "ready");
    await expect(advice(page)).toHaveAttribute("data-advice", "rejected");
    await expect(raw(page)).toHaveAttribute("data-code", "4001");
  });

  test("sends the same refusal back to the start when it is the connection", async ({
    page,
  }) => {
    await openDemo(page);
    await press(page, "connect");
    await press(page, "reject");

    await expect(status(page)).toHaveAttribute("data-status", "disconnected");
    await expect(raw(page)).toHaveAttribute("data-code", "4001");
  });

  test("does not open a second request when one is already pending", async ({ page }) => {
    await openDemo(page);
    await press(page, "connect");
    await press(page, "busy");

    await expect(status(page)).toHaveAttribute("data-status", "connecting");
    await expect(raw(page)).toHaveAttribute("data-code", "-32002");
  });

  test("follows the network moving under a connected app", async ({ page }) => {
    await openDemo(page);
    await connect(page);
    await expect(status(page)).toHaveAttribute("data-status", "ready");

    await demo(page).locator('[data-chain="137"]').click();
    await expect(status(page)).toHaveAttribute("data-status", "wrongChain");

    await demo(page).locator('[data-chain="1"]').click();
    await expect(status(page)).toHaveAttribute("data-status", "ready");
  });

  test("writes every transition it made", async ({ page }) => {
    await openDemo(page);
    await connect(page);

    await expect(demo(page).locator("[data-step]")).toHaveCount(2);
    await expect(demo(page).locator('[data-step="approve"]')).toContainText("ready");
  });
});
