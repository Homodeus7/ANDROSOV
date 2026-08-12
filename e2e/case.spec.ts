import { test, expect, type Page } from "@playwright/test";

/**
 * `scrollIntoViewIfNeeded` прокручивает мимо Lenis, и тот ещё какое-то время
 * доводит страницу сам. Рамку карточки нужно снимать, когда она встала
 */
async function settleScroll(page: Page) {
  let previous = -1;

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const current = await page.evaluate(() => Math.round(window.scrollY));
    if (current === previous) return current;

    previous = current;
    await page.waitForTimeout(80);
  }

  throw new Error("scroll never settled");
}

test.describe("case page", () => {
  test("carries the page title and the neighbour band", async ({ page }) => {
    await page.goto("/en/work/foodiq");

    await expect(page.locator("h1[data-page-title]")).toHaveText("FoodIQ");

    const neighbours = page.locator('nav a[href*="/work/"]');
    await expect(neighbours).toHaveCount(2);
    for (const href of await neighbours.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    )) {
      expect(href).not.toContain("/work/foodiq");
    }
  });

  // Карточка на главной ведёт себя как соседи внизу кейса: сначала подъём,
  // потом переход. Разными механиками эти два пути и разошлись
  test("glides to the top before it opens a card from the index", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "переход разобран на десктопе");

    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(1000);

    const card = page.locator('a[href$="/work/blocks-editor"]').first();
    await card.scrollIntoViewIfNeeded();

    const start = await settleScroll(page);
    expect(start).toBeGreaterThan(500);

    await card.click();
    await page.waitForTimeout(250);

    expect(page.url(), "страница едет вверх раньше перехода").not.toContain("blocks-editor");
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(start);

    await expect(page).toHaveURL(/\/work\/blocks-editor$/);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  });

  // Соседний кейс короче текущего, поэтому переход первым схлопывал позицию
  // до высоты новой страницы — замер показал скачок 3706 → 2759 и только потом
  // плавный ход. Прокрутка идёт до перехода, и приходит в самый верх, а не
  // к началу <main> под липкой шапкой
  test("glides to the top before it swaps the case", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "переход разобран на десктопе");

    await page.goto("/en/work/blocks-editor", { waitUntil: "load" });
    await page.waitForTimeout(1000);

    // Колесом, а не `scrollIntoView`: тот прокручивает мимо Lenis, и подъём
    // потом стартует с его внутренней позиции — на замере это скачок в 182 px,
    // которого у живого пользователя нет
    for (let turn = 0; turn < 25; turn += 1) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(60);
    }

    // Затухающий хвост Lenis длится тем дольше, чем длиннее страница: секунды
    // перестало хватать, как только у кейса появилось второе демо
    let start = -1;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const current = await page.evaluate(() => Math.round(window.scrollY));
      if (current === start) break;
      start = current;
      await page.waitForTimeout(150);
    }
    expect(start).toBeGreaterThan(1000);

    await page.locator("nav[aria-label] a").last().click();
    await page.waitForTimeout(250);

    expect(page.url(), "страница едет вверх раньше перехода").toContain("blocks-editor");
    const moving = await page.evaluate(() => Math.round(window.scrollY));
    expect(moving).toBeLessThan(start);

    await expect(page).toHaveURL(/\/work\/payment-gateways$/);
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(0);
  });

  test("serves an og image for every case", async ({ request }) => {
    const response = await request.get("/en/work/foodiq/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});
