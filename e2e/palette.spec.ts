import { test, expect, type Page } from "@playwright/test";

const wheel = async (page: Page, x: number, y: number) => {
  await page.mouse.move(x, y);
  for (let tick = 0; tick < 5; tick += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
};

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

// Плавная прокрутка слушает колесо на окне и двигает страницу сама, поэтому
// блокировка модалки её не касалась: под открытой палитрой уезжал сайт, а сам
// список стоял. Замер до правки — 0 → 600 над затемнением, 0 → 1200 над списком
test.describe("command palette", () => {
  test("holds the page still and scrolls its own list", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "колеса на тач-устройстве нет");

    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.getByPlaceholder("Type a destination…")).toBeFocused();

    await wheel(page, 200, 600);
    expect(await scrollY(page), "колесо над затемнением").toBe(0);

    await wheel(page, 640, 420);
    expect(await scrollY(page), "колесо над списком").toBe(0);

    const listTop = await page
      .locator("[cmdk-list]")
      .evaluate((node) => Math.round(node.scrollTop));
    expect(listTop, "список должен был прокрутиться сам").toBeGreaterThan(0);
  });

  test("gives the page back once it closes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "колеса на тач-устройстве нет");

    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder("Type a destination…")).toBeHidden();

    await wheel(page, 640, 400);
    expect(await scrollY(page)).toBeGreaterThan(0);
  });
});
