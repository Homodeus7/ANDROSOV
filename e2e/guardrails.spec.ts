import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#guardrails");
const gate = (page: Page, id: string) => demo(page).locator(`[data-gate="${id}"]`);
const outcome = (page: Page) => demo(page).locator("[data-outcome]");

const choose = (page: Page, id: string) => demo(page).locator(`[data-diff="${id}"]`).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(gate(page, "layers")).toBeVisible();
}

test.describe("guardrails demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(gate(page, "layers")).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(gate(page, "layers")).toBeVisible();
  });

  // Каждая правка отбивается ровно теми воротами, что заявлены — и никакими другими
  const cases: [string, string][] = [
    ["helper-upwards", "layers"],
    ["english-only", "content"],
    ["missing-ru-string", "i18n"],
    ["model-in-resolver", "boundary"],
    ["heavy-dependency", "budget"],
  ];

  for (const [diff, caught] of cases) {
    test(`stops "${diff}" at the ${caught} gate and nowhere else`, async ({ page }) => {
      await openDemo(page);
      await choose(page, diff);

      await expect(outcome(page)).toHaveAttribute("data-outcome", "stopped");
      await expect(gate(page, caught)).not.toHaveAttribute("data-passed", "");
      await expect(demo(page).locator("[data-gate]:not([data-passed])")).toHaveCount(1);
    });
  }

  test("lets the honest diff through every gate", async ({ page }) => {
    await openDemo(page);
    await choose(page, "honest");

    await expect(outcome(page)).toHaveAttribute("data-outcome", "passed");
    await expect(demo(page).locator("[data-gate][data-passed]")).toHaveCount(5);
  });

  // Правка, против которой была только инструкция, доезжает — в этом и смысл
  test("lets through the diff only the instruction file objected to", async ({ page }) => {
    await openDemo(page);
    await choose(page, "narrating-comment");

    await expect(outcome(page)).toHaveAttribute("data-outcome", "advice");
    await expect(demo(page).locator("[data-gate][data-passed]")).toHaveCount(5);
  });

  test("prints the message the build would print", async ({ page }) => {
    await openDemo(page);
    await choose(page, "helper-upwards");

    await expect(gate(page, "layers")).toContainText("imports go downwards only");
  });
});
