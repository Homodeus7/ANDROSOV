import { test, expect, type Page } from "@playwright/test";
import { overflowReport } from "./overflow";

const menu = (page: Page) => page.getByRole("dialog", { name: "Site navigation" });
const trigger = (page: Page) => page.getByRole("button", { name: "Menu" });

const open = async (page: Page) => {
  await page.goto("/en", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await trigger(page).click();
  await expect(menu(page)).toBeVisible();
};

test.describe("mobile navigation", () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "экран только для узких");
  });

  // Шапка уезжает после 200px вниз. Пока единственный вход в навигацию жил в
  // ней, на длинной странице до него было не добраться — этот тест и стоит
  // ровно на том месте, где баг вернётся
  test("keeps the trigger reachable after the header leaves", async ({ page }) => {
    await page.goto("/en", { waitUntil: "load" });
    await page.waitForTimeout(600);
    await expect(trigger(page)).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, 1200));
    await page.waitForTimeout(600);

    await expect(page.locator("[data-site-header]")).toHaveJSProperty(
      "style.transform",
      "translateY(-100%)",
    );
    await expect(trigger(page)).toBeVisible();
  });

  test("reaches every section and case", async ({ page }) => {
    await open(page);

    const rows = menu(page).locator("[data-nav-list] a");
    await expect(rows).toHaveCount(10);

    for (const name of ["Work", "Lab", "About", "Resume"]) {
      await expect(menu(page).getByRole("link", { name, exact: false })).toBeVisible();
    }
  });

  // Оверлей лежит в верхнем слое, и `overflow-x: hidden` с body его не
  // подрезает: то, что не влезло, превращается в прокрутку и пустоту справа
  for (const width of [360, 390]) {
    test(`fits ${width}px in both locales`, async ({ page }) => {
      await page.setViewportSize({ width, height: 760 });

      for (const [locale, open, label] of [
        ["en", "Menu", "Site navigation"],
        ["ru", "Меню", "Навигация по сайту"],
      ]) {
        await page.goto(`/${locale}`, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(600);
        await page.getByRole("button", { name: open }).click();
        await expect(page.getByRole("dialog", { name: label })).toBeVisible();
        await page.waitForTimeout(500);

        const report = await overflowReport(page);
        expect(report.escaped, `${locale} @ ${width}`).toEqual([]);
        expect(report.spilled, `${locale} @ ${width}`).toEqual([]);
        expect(
          await page.evaluate(() => {
            const panel = document.querySelector("dialog")!;
            return panel.scrollWidth - panel.clientWidth;
          }),
          `${locale} @ ${width}: панель шире экрана`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }

  test("navigates to a section and closes", async ({ page }) => {
    await open(page);
    await menu(page).getByRole("link", { name: "About" }).click();

    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(menu(page)).toBeHidden();
  });

  test("the back button closes the menu instead of leaving the page", async ({ page }) => {
    await open(page);

    await page.goBack();
    await expect(menu(page)).toBeHidden();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("gives the page scroll back once it closes", async ({ page }) => {
    await open(page);
    await menu(page).getByRole("button", { name: "Close" }).click();
    await expect(menu(page)).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(0);
  });
});
