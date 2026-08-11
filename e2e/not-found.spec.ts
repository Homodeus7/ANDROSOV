import { test, expect } from "@playwright/test";

test.describe("not found", () => {
  // Без ловушки `[...rest]` несуществующий адрес не совпадает ни с одним
  // сегментом, layout локали не отрисовывается, и Next отдаёт свою служебную
  // страницу — без шапки, подвала и перевода. Поэтому проверяется и то, и то
  test("answers 404 and keeps the site around it", async ({ page }) => {
    const response = await page.goto("/ru/nope");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Здесь ничего нет");
    await expect(page.locator("[data-site-header]")).toBeVisible();
    await expect(page.locator("[data-site-footer]")).toBeVisible();
  });

  test("answers 404 for a case that does not exist", async ({ page }) => {
    const response = await page.goto("/en/work/nope");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("There is nothing here");
  });

  test("sends an address outside the locales into one", async ({ page }) => {
    await page.goto("/nope");

    await expect(page).toHaveURL(/\/(en|ru)\/nope$/);
  });

  test("offers the way back", async ({ page }) => {
    await page.goto("/en/nope");
    await page.locator('main a[href="/en/lab"]').click();

    await expect(page).toHaveURL(/\/en\/lab$/);
  });
});
