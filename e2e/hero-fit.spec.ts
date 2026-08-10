import { test, expect, type Page } from "@playwright/test";

const TOLERANCE_PX = 8;

async function measureHeadline(page: Page) {
  return page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) throw new Error("headline not found");
    const host = h1.getBoundingClientRect();

    return [...h1.querySelectorAll<HTMLElement>("[data-hero-line]")].map((line) => {
      const text = line.querySelector<HTMLElement>("[data-hero-text]");
      const glyphs = text ? [...text.children] : [];
      const boxes = (glyphs.length > 0 ? glyphs : [text!]).map((el) =>
        el.getBoundingClientRect(),
      );

      return {
        fontSize: parseFloat(getComputedStyle(line).fontSize),
        left: Math.min(...boxes.map((box) => box.left)) - host.left,
        right: Math.max(...boxes.map((box) => box.right)) - host.right,
        hostWidth: host.width,
      };
    });
  });
}

for (const motion of ["no-preference", "reduce"] as const) {
  test(`headline fills its container without spilling (${motion})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion === "reduce" ? "reduce" : "no-preference" });
    await page.goto("/en");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);

    const lines = await measureHeadline(page);
    expect(lines.length).toBe(2);

    for (const line of lines) {
      // 17px означает, что inline font-size стёрли и строка упала на body-размер
      expect(line.fontSize).toBeGreaterThan(line.hostWidth / 12);
      expect(line.right).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(line.left).toBeGreaterThanOrEqual(-TOLERANCE_PX);
      expect(line.right).toBeGreaterThan(-TOLERANCE_PX * 4);
    }
  });
}
