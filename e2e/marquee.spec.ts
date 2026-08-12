import { test, expect, type Page } from "@playwright/test";

const WIDTHS = [390, 768, 1440, 2560];

const measure = (page: Page) =>
  page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-marquee-track]");
    const copy = document.querySelector<HTMLElement>("[data-marquee-copy]");
    if (!track || !copy || !track.parentElement) return null;
    return {
      slack: track.offsetWidth - copy.offsetWidth - track.parentElement.clientWidth,
      copies: track.childElementCount,
      shift: getComputedStyle(track).getPropertyValue("--marquee-shift").trim(),
    };
  });

test.describe("marquee", () => {
  for (const width of WIDTHS) {
    test(`covers ${width}px through the whole cycle`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/ru");

      await expect
        .poll(async () => (await measure(page))?.slack ?? -1)
        .toBeGreaterThanOrEqual(0);

      const stats = (await measure(page))!;
      expect(stats.shift).toBe(`${-100 / stats.copies}%`);
    });
  }

  test("holds the cover after a resize", async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 });
    await page.goto("/ru");
    await expect(page.locator("[data-marquee-copy]")).toBeVisible();

    await page.setViewportSize({ width: 2560, height: 800 });
    await expect.poll(async () => (await measure(page))?.slack ?? -1).toBeGreaterThanOrEqual(0);
  });
});
