import { test, expect, type Page } from "@playwright/test";

const WAIT = { timeout: 15_000 };

const demo = (page: Page) => page.locator("#meal-stream");
const state = (page: Page) => demo(page).locator("[data-phase]");
const lines = (page: Page, status?: string) =>
  demo(page).locator(status ? `[data-line][data-status="${status}"]` : "[data-line]");
const total = (page: Page) => demo(page).locator("[data-total]");

const choose = (page: Page, chip: string) =>
  demo(page).locator(`[data-chip="${chip}"]`).click();

/** Итог доезжает до цели анимацией, а разряды приходят отформатированными. */
const shownTotal = (page: Page) => async () =>
  Number((await total(page).innerText()).replace(/\D/g, ""));

async function openDemo(page: Page) {
  await page.goto("/en/work/foodiq");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(total(page)).toBeVisible();
}

test.describe("meal stream demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/work/foodiq");
    await expect(total(page)).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(total(page)).toBeVisible();
  });

  test("shows skeletons first, then links every item and sums them", async ({ page }) => {
    await openDemo(page);
    await choose(page, "oatmeal");

    await expect(lines(page, "pending")).toHaveCount(5, WAIT);
    await expect(state(page)).toHaveAttribute("data-phase", "done", WAIT);
    await expect(lines(page, "linked")).toHaveCount(5);

    const expected = Number(await total(page).getAttribute("data-total"));
    expect(expected).toBeGreaterThan(0);
    await expect.poll(shownTotal(page), WAIT).toBe(expected);
  });

  test("streams bytes, not frames: chunks outnumber the frames they carry", async ({
    page,
  }) => {
    await openDemo(page);
    await choose(page, "buckwheat");
    await expect(state(page)).toHaveAttribute("data-wire", "closed", WAIT);

    const chunks = await demo(page).locator('[data-log="chunk"]').count();
    const frames = await demo(page).locator('[data-log="event"]').count();
    expect(frames).toBe(5);
    expect(chunks).toBeGreaterThan(frames);
    await expect(demo(page).locator('[data-event="done"]')).toHaveCount(1);
  });

  test("keeps an ambiguous item unlinked and out of the total", async ({ page }) => {
    await openDemo(page);
    await choose(page, "ambiguous");
    await expect(state(page)).toHaveAttribute("data-phase", "done", WAIT);

    await expect(lines(page, "failed")).toHaveCount(1);
    await expect(lines(page, "failed")).toContainText("cottage cheese");

    const expected = Number(await total(page).getAttribute("data-total"));
    const summed = async () => {
      const linked = await lines(page, "linked").locator("[data-kcal]").allInnerTexts();
      return linked.reduce((carry, text) => carry + Number(text), 0);
    };
    await expect.poll(summed, WAIT).toBe(expected);
  });

  test("offers a retry after the connection drops mid-frame", async ({ page }) => {
    await openDemo(page);
    await choose(page, "drop");

    await expect(demo(page).locator('[data-error="transport"]')).toBeVisible(WAIT);
    await expect(demo(page).locator('[data-log="dropped"]')).toHaveCount(1);
    await expect(lines(page, "linked")).toHaveCount(2);
    await expect(lines(page, "stalled")).toHaveCount(1);

    await demo(page).getByRole("button", { name: "Retry", exact: true }).click();
    await expect(state(page)).toHaveAttribute("data-phase", "done", WAIT);
    await expect(lines(page, "linked")).toHaveCount(3);
    await expect(demo(page).locator("[data-error]")).toHaveCount(0);
  });

  test("does not offer a retry for a domain error", async ({ page }) => {
    await openDemo(page);
    await choose(page, "notFood");

    await expect(demo(page).locator('[data-error="domain"]')).toBeVisible(WAIT);
    await expect(demo(page).getByRole("button", { name: "Retry", exact: true })).toHaveCount(0);
    await expect(lines(page)).toHaveCount(0);
  });

  test("parses a phrase typed by hand", async ({ page }) => {
    await openDemo(page);
    await demo(page).getByLabel("What did you eat").fill("2 eggs and an apple");
    await demo(page).getByRole("button", { name: "Parse", exact: true }).click();

    await expect(state(page)).toHaveAttribute("data-phase", "done", WAIT);
    await expect(lines(page, "linked")).toHaveCount(2);
    await expect(lines(page).first()).toContainText("2");
  });
});
