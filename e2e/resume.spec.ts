import { test, expect } from "@playwright/test";

test.describe("resume and about", () => {
  test("lists every job with its stack", async ({ page }) => {
    await page.goto("/en/resume");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Viacheslav Androsov");
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(5);
    await expect(page.getByText("Frontend Developer (Vue)")).toBeVisible();
  });

  // Резюме и кейс говорят об одной работе, и это должно быть проверяемо
  test("links each job to the case that tells the same story", async ({ page }) => {
    await page.goto("/en/resume");

    await page.getByRole("link", { name: "Read the case →" }).first().click();
    await expect(page).toHaveURL(/\/en\/work\/blocks-editor$/);
  });

  test("gives the name in the language of the page", async ({ page }) => {
    await page.goto("/ru/resume");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Вячеслав Андросов");
  });

  // PDF собран из того же текста, что и страница, поэтому файл обязан лежать
  // рядом и отдаваться, а не отвечать 404 после переименования
  test("hands out the pdf of the page's own language", async ({ page, request }) => {
    for (const [locale, file] of [
      ["en", "Androsov_Viacheslav_Frontend_EN.pdf"],
      ["ru", "Androsov_Viacheslav_Frontend_RU.pdf"],
    ]) {
      await page.goto(`/${locale}/resume`);
      const link = page.locator(`a[href="/resume/${file}"]`);
      await expect(link).toHaveAttribute("download", "");

      const response = await request.get(`/resume/${file}`);
      expect(response.status(), file).toBe(200);
      expect(response.headers()["content-type"]).toContain("pdf");
    }
  });

  test("says something on the about page", async ({ page }) => {
    await page.goto("/en/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("under load");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);
  });

  // Ссылки шапки на узком экране спрятаны — туда ведёт командная панель
  test("offers the work grid from the header", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "the header nav is desktop only");
    await page.goto("/en/lab");
    await page.getByRole("navigation").getByRole("link", { name: "Work" }).click();

    await expect(page).toHaveURL(/\/en$/);
  });
});
