import { test, expect } from "@playwright/test";
import { overflowReport } from "./overflow";

const SLUGS = [
  "foodiq",
  "blocks-editor",
  "payment-gateways",
  "property-ops",
  "web3-terminal",
  "tender-stat",
];

// Обе локали, а не только английская: русские слова длиннее, и упирается в
// край экрана всегда русский набор — «Лаборатория» на узком телефоне
const ROUTES = ["en", "ru"].flatMap((locale) => [
  `/${locale}`,
  `/${locale}/lab`,
  `/${locale}/about`,
  `/${locale}/resume`,
  ...SLUGS.map((slug) => `/${locale}/work/${slug}`),
]);

test.describe("smoke", () => {
  for (const route of ROUTES) {
    test(`renders ${route}`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main")).toBeVisible();
    });
  }

  test("redirects root to a locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|ru)$/);
  });

  test("serves the ru locale", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  });

  for (const route of ROUTES) {
    test(`fits the viewport on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      const report = await overflowReport(page);

      expect(report.scrolls).toBe(false);
      expect(report.escaped).toEqual([]);
      expect(report.spilled).toEqual([]);
    });
  }
});
