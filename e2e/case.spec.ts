import { test, expect, type Page } from "@playwright/test";

type Box = { x: number; y: number; width: number; height: number };

const distance = (a: Box, b: Box) => Math.hypot(a.x - b.x, a.y - b.y);

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

type Flight = { source: Box | null; frames: Box[] };

/**
 * Кадры перелёта пишет сама страница: переход клиентский, контекст переживает
 * его. Замеры из процесса теста ловят перелёт как повезёт, а на узком экране
 * весь ход укладывается в четверть секунды — первые кадры терялись.
 *
 * Рамка карточки снимается тем же кликом на всплытии вниз, а не заранее: клик
 * Playwright сам подкручивает высокую карточку в вид, да и подъём страницы
 * начинается сразу за ним — к моменту перехода карточка уже не там
 */
async function recordFlight(page: Page, source: string) {
  await page.evaluate((selector) => {
    const rect = (node: Element) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    };

    const flight: Flight = { source: null, frames: [] };
    (window as unknown as { __flight: Flight }).__flight = flight;

    document.addEventListener(
      "click",
      () => {
        const node = document.querySelector(selector);
        if (node) flight.source = rect(node);
      },
      true,
    );

    const tick = () => {
      const node = document.querySelector("h1 [data-flip-id]");
      if (node) flight.frames.push(rect(node));
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, source);

  return () => page.evaluate(() => (window as unknown as { __flight: Flight }).__flight);
}

test.describe("case page", () => {
  test("carries the shared-element target and the neighbour band", async ({ page }) => {
    await page.goto("/en/work/foodiq");

    await expect(page.locator('h1 [data-flip-id="case-foodiq"]')).toBeVisible();

    const neighbours = page.locator('nav a[href*="/work/"]');
    await expect(neighbours).toHaveCount(2);
    for (const href of await neighbours.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    )) {
      expect(href).not.toContain("/work/foodiq");
    }
  });

  test("flies the title over from the card it was opened from", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator('a[href$="/work/blocks-editor"]').first();
    await card.scrollIntoViewIfNeeded();
    await settleScroll(page);

    const flight = await recordFlight(page, '[data-flip-id="case-blocks-editor"]');
    await card.click();

    await expect(page).toHaveURL(/\/work\/blocks-editor$/);
    await page.waitForTimeout(1200);

    const { source, frames } = await flight();
    expect(source, "клик по карточке не зафиксирован").not.toBeNull();
    expect(frames.length).toBeGreaterThan(4);

    const from = source!;
    const first = frames[0];
    const landed = frames[frames.length - 1];

    // На узком экране карточка и заголовок стоят почти на одном месте, поэтому
    // одной координаты мало: перелёт стартует и позицией, и кеглем карточки
    expect(distance(first, from), "заголовок не стартовал от карточки").toBeLessThan(4);
    expect(Math.abs(first.height - from.height)).toBeLessThan(from.height * 0.1);

    expect(distance(first, landed) + Math.abs(first.height - landed.height)).toBeGreaterThan(8);
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
