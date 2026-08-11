import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/en", "/en/lab", "/en/about", "/en/resume", "/en/work/blocks-editor"];

// Демо монтируются по появлению во вьюпорте, поэтому до прокрутки axe их
// просто не увидит — а половина интерактива сайта живёт именно там
async function wakeDemos(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
}

const scan = (page: Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

test.describe("accessibility", () => {
  // Сканируем с выключенной анимацией. Элемент, пойманный посреди проявления,
  // даёт ложный провал по контрасту: axe считает цвет полупрозрачного текста,
  // которого через долю секунды не будет. Проверять надо конечное состояние —
  // ровно его и видит пользователь с `prefers-reduced-motion`
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  for (const route of ROUTES) {
    test(`has no axe violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await wakeDemos(page);

      const results = await scan(page);
      const summary = results.violations.map(
        (violation) =>
          `${violation.id} (${violation.impact}) × ${violation.nodes.length}: ${violation.nodes[0]?.target.join(" ")}`,
      );

      expect(summary, summary.join("\n")).toEqual([]);
    });
  }

  test("keeps the same result in the dark theme", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    const results = await scan(page);
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });
});

// axe не ходит по странице клавиатурой: ловушки фокуса и порядок табуляции
// он не видит в принципе, поэтому это проверяется отдельно
test.describe("keyboard", () => {
  // Проект `mobile` эмулирует тач-устройство: обхода по Tab там нет как
  // явления, и проверять на нём клавиатуру было бы самообманом
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "no tab traversal on a touch device");
  });

  test("hands the first tab stop to the skip link", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("lets the keyboard reach the demo controls", async ({ page }) => {
    await page.goto("/en/lab");
    await page.locator("#canvas-fps").scrollIntoViewIfNeeded();

    const naive = page
      .locator("#canvas-fps")
      .getByRole("button", { name: "Naive", exact: true });
    await naive.focus();
    await expect(naive).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.locator("#canvas-fps").getByRole("button", { name: "Frame budget", exact: true }),
    ).toBeFocused();
  });

  test("keeps the command palette escapable", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("ControlOrMeta+k");

    // Ищем поле ввода, а не обёртку диалога: у cmdk она сама по себе
    // нулевого размера, и её видимость ничего не говорит
    const search = page.getByPlaceholder("Type a destination…");
    await expect(search).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(search).toBeHidden();
  });
});
