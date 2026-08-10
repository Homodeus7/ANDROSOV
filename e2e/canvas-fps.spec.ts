import { test, expect, type Page } from "@playwright/test";

const cell = (page: Page, index: number) =>
  page.locator("#canvas-fps .display.text-2xl").nth(index);
const reads = (page: Page) => cell(page, 3);

async function openDemo(page: Page) {
  await page.goto("/en/lab");
  await page.locator("#canvas-fps").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-fps-block]").first()).toBeVisible();
}

const press = (page: Page, name: string) =>
  page.locator("#canvas-fps").getByRole("button", { name, exact: true }).click();

test.describe("frame budget demo", () => {
  test("mounts the Vue island only once it reaches the viewport", async ({ page }) => {
    await page.goto("/en/lab");
    await expect(page.locator("[data-fps-block]")).toHaveCount(0);

    await page.locator("#canvas-fps").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-fps-block]").first()).toBeVisible();
  });

  test("draws the same scene either way — one link fewer than blocks", async ({ page }) => {
    await openDemo(page);
    await press(page, "40");

    for (const mode of ["Naive", "Frame budget"]) {
      await press(page, mode);
      await expect(page.locator("[data-fps-block]")).toHaveCount(40);
      await expect(page.locator("[data-fps-wire]")).toHaveCount(39);
    }
  });

  // Заявлено не «быстрее», а «не читает DOM»: именно чередование замеров с
  // записью и стоит кадра, поэтому счётчик замеров и есть предмет проверки
  test("reads the DOM every frame when naive, and never on budget", async ({ page }) => {
    await openDemo(page);
    await press(page, "120");

    await press(page, "Naive");
    await expect.poll(async () => Number(await reads(page).innerText())).toBeGreaterThan(100);

    await press(page, "Frame budget");
    await expect.poll(async () => Number(await reads(page).innerText())).toBe(0);
  });

  test("keeps the loop running when naive is paused, and stops it on budget", async ({
    page,
  }) => {
    await openDemo(page);

    await press(page, "Naive");
    await press(page, "Pause");
    await expect(page.locator("[data-loop]")).toHaveAttribute("data-loop", "awake");
    await expect
      .poll(async () => Number(await page.locator("[data-wasted]").getAttribute("data-wasted")))
      .toBeGreaterThan(0);

    await press(page, "Run");
    await press(page, "Frame budget");
    await press(page, "Pause");
    await expect(page.locator("[data-loop]")).toHaveAttribute("data-loop", "asleep");
  });

  test("remembers a measurement per mode so the two can be compared", async ({ page }) => {
    await openDemo(page);
    await press(page, "40");

    await press(page, "Naive");
    await expect(page.locator('[data-result="Naive"]')).toBeVisible({ timeout: 15000 });

    await press(page, "Frame budget");
    await expect(page.locator('[data-result="Frame budget"]')).toBeVisible({ timeout: 15000 });
    // Прошлый замер остаётся на месте: режимы меряются по очереди, и сравнить
    // их можно только если предыдущий результат никуда не делся
    await expect(page.locator('[data-result="Naive"]')).toBeVisible();
  });
});
