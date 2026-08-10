import { test, expect } from "@playwright/test";

test.describe("reduced motion", () => {
  test("freezes the marquee and leaves revealed content visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await page.evaluate(() => document.fonts.ready);

    const marqueeAnimation = await page
      .locator(".marquee-track")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(marqueeAnimation).toBe("none");

    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>("[data-reveal] > *")].filter(
          (el) => Number(getComputedStyle(el).opacity) < 1,
        ).length,
    );
    expect(hidden).toBe(0);

    const pinned = await page.evaluate(() => document.querySelectorAll(".pin-spacer").length);
    expect(pinned).toBe(0);
  });
});

test.describe("motion", () => {
  test("pins the hero only above the mobile breakpoint", async ({ page }, testInfo) => {
    await page.goto("/en");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const pinned = await page.evaluate(() => document.querySelectorAll(".pin-spacer").length);
    expect(pinned).toBe(testInfo.project.name === "mobile" ? 0 : 1);
  });
});
