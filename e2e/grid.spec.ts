import { test, expect } from "@playwright/test";

test("the grid overlay spans every column of the page grid", async ({ page }, testInfo) => {
  await page.goto("/en");
  await page.keyboard.press("g");

  const measured = await page.locator("[data-col]").evaluateAll((nodes) => {
    const boxes = nodes
      .map((node) => node.getBoundingClientRect())
      .filter((box) => box.width > 0);

    return {
      count: boxes.length,
      right: Math.max(...boxes.map((box) => box.right)),
      viewport: document.documentElement.clientWidth,
    };
  });

  // Сетка обязана повторять grid-page: 4 колонки на мобиле, 12 на десктопе.
  // Меньше — значит оверлей накрывает не всю ширину и врёт про раскладку
  expect(measured.count).toBe(testInfo.project.name === "mobile" ? 4 : 12);
  expect(measured.right).toBeGreaterThan(measured.viewport * 0.9);
});
