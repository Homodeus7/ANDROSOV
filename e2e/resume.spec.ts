import { test, expect } from "@playwright/test";

test.describe("resume and about", () => {
  test("lists every job with its stack", async ({ page }) => {
    await page.goto("/en/resume");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Viacheslav Androsov");
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(5);
    await expect(page.getByText("Frontend engineer — editor core (Vue)")).toBeVisible();
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

  test("keeps the print button out of print", async ({ page }) => {
    await page.goto("/en/resume");
    const button = page.getByRole("button", { name: "Print / PDF" });
    await expect(button).toBeVisible();

    await page.emulateMedia({ media: "print" });
    await expect(button).toBeHidden();
    await expect(page.locator("[data-site-header]")).toBeHidden();
  });

  test("says something on the about page", async ({ page }) => {
    await page.goto("/en/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("breaks");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);
  });

  // Ссылки шапки на узком экране спрятаны — туда ведёт командная панель
  test("offers the work grid from the header", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "the header nav is desktop only");
    await page.goto("/en/lab");
    await page.getByRole("navigation").getByRole("link", { name: "Work" }).click();

    await expect(page).toHaveURL(/\/en#work$/);
  });
});
