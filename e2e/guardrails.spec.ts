import { test, expect, type Page } from "@playwright/test";

const demo = (page: Page) => page.locator("#guardrails");
const gate = (page: Page, id: string) => demo(page).locator(`[data-gate="${id}"]`);
const tier = (page: Page, id: string) => demo(page).locator(`[data-tier="${id}"]`);
const outcome = (page: Page) => demo(page).locator("[data-outcome]");

const choose = (page: Page, id: string) => demo(page).locator(`[data-diff="${id}"]`).click();

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await demo(page).scrollIntoViewIfNeeded();
  await expect(gate(page, "boundary")).toBeVisible();
}

// Демо снято с показа: см. `src/widgets/demos/guardrails/index.ts`
test.describe.skip("guardrails demo", () => {
  test("loads only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(gate(page, "boundary")).toHaveCount(0);

    await demo(page).scrollIntoViewIfNeeded();
    await expect(gate(page, "boundary")).toBeVisible();
  });

  // Каждая правка отбивается ровно теми воротами, что заявлены — и никакими другими
  const stoppedByBuild: [string, string][] = [
    ["import-up", "boundary"],
    ["hand-edit-generated", "contract"],
    ["ratchet-grows", "lint"],
  ];

  for (const [diff, caught] of stoppedByBuild) {
    test(`stops "${diff}" at the ${caught} gate and nowhere else`, async ({ page }) => {
      await openDemo(page);
      await choose(page, diff);

      await expect(outcome(page)).toHaveAttribute("data-outcome", "build");
      await expect(gate(page, caught)).not.toHaveAttribute("data-passed", "");
      await expect(demo(page).locator("[data-gate]:not([data-passed])")).toHaveCount(1);
    });
  }

  // Цепочку не зовут по правке, которую уже не пропустила сборка
  test("spends no model call on a diff the build refused", async ({ page }) => {
    await openDemo(page);
    await choose(page, "import-up");

    await expect(tier(page, "chain")).toContainText("model calls: 0");
    await expect(demo(page).locator("[data-link]")).toHaveCount(0);
  });

  test("lets the honest diff through all three tiers", async ({ page }) => {
    await openDemo(page);
    await choose(page, "slot-from-above");

    await expect(outcome(page)).toHaveAttribute("data-outcome", "passed");
    await expect(demo(page).locator("[data-gate][data-passed]")).toHaveCount(3);
    await expect(demo(page).locator("[data-link][data-silent]")).toHaveCount(4);
    await expect(tier(page, "chain")).toContainText("model calls: 4");
  });

  test("stops at the first link that objects, and charges only for the links that ran", async ({
    page,
  }) => {
    await openDemo(page);
    await choose(page, "card-fetches");

    await expect(outcome(page)).toHaveAttribute("data-outcome", "chain");
    await expect(demo(page).locator("[data-gate][data-passed]")).toHaveCount(3);
    await expect(demo(page).locator("[data-link]:not([data-silent])")).toHaveCount(1);
    await expect(tier(page, "chain")).toContainText("model calls: 1");
  });

  test("prints the message the build would print", async ({ page }) => {
    await openDemo(page);
    await choose(page, "ratchet-grows");

    await expect(gate(page, "lint")).toContainText("debt grew");
  });

  // Измерение без потолка называет число и пропускает — так в репозитории и есть
  test("names a number the repository has no ceiling for", async ({ page }) => {
    await openDemo(page);
    await choose(page, "slot-from-above");

    await expect(demo(page).locator('[data-meter="size"]')).toContainText("no ceiling");
  });
});
