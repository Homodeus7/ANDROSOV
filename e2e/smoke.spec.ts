import { test, expect } from "@playwright/test";

const ROUTES = [
  "/en",
  "/ru",
  "/en/lab",
  "/en/about",
  "/en/resume",
  "/en/work/foodiq",
  "/en/work/blocks-editor",
  "/en/work/payment-gateways",
  "/en/work/property-ops",
  "/en/work/stardex",
];

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

      const widest = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;

        // data-clip помечает места, где обрезка по горизонтали — сознательное решение
        const insideScroller = (el: HTMLElement) => {
          for (
            let node = el.parentElement;
            node && node !== document.body;
            node = node.parentElement
          ) {
            if (node.hasAttribute("data-clip")) return true;
            if (/^(auto|scroll)$/.test(getComputedStyle(node).overflowX)) return true;
          }
          return false;
        };

        const offenders: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          if (rect.right <= limit + 1 && rect.left >= -1) continue;
          if (insideScroller(el)) continue;
          offenders.push(`${el.tagName}.${el.className}`.slice(0, 80));
        }

        return {
          offenders: offenders.slice(0, 5),
          scrolls: document.documentElement.scrollWidth > limit,
        };
      });

      expect(widest.scrolls).toBe(false);
      expect(widest.offenders).toEqual([]);
    });
  }
});
